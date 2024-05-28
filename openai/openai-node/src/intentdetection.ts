// thanks to https://sourajit16-02-93.medium.com/call-your-own-api-from-chatgpt-natural-language-to-action-47cbaf568b56

import readline from 'readline';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';
import itemApi from './itemApi';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SHOP_NAME = process.env.SHOP_NAME;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
};

const CONVERSATION_PROMPT = `You are a smart conversation agent.
Shop name is ${SHOP_NAME}.
You assist the customers to enquire about our services.
Your task is to follow the bellow conversation flow to assist the customers.

###
Conversation Flow:
1. Greet the customer
2. Check if they need any assistance.
3. Answer their requiests
4. Greet the customer and ask if they need any further assistance. or End the conversation.
###

Please respond 'OK' if you are clear about you task.
`

const INTENT_DETECTION = `
Your task is to classify the customer's intent from the below "Conversation" between an agent and a customer into following "Intent Categories". Response should follow the "Output Format".

Intent Categories:
GREETING: Customer is greeting the chatbot.
RESERVATION_DATE_ENQUERY: Customer's general query for the date is available for reservation.
ITEM_PRICE_ENQUERY: Customer's query price of the item.
OUT_OF_CONTEXT: Customer's query which is irrelivent and can not be classified in the above three intents.
END_CONVERSATION: Customer has got answer and wants to end the conversation.

Output Format:
PREDICTED_INTENT
`;

export const get_chat_completion = async (
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-4o' // 'gpt-3.5-turbo'
) => {
    return openai.chat.completions.create({
        messages: messages,
        model // 'gpt-4o',
    });
}

export const get_intent_detection = async (
    conversation: ChatCompletionMessageParam[],
) => {
    const messages: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: INTENT_DETECTION,
    }, {
        role: 'user',
        content: `Converation:\n${JSON.stringify(conversation)}`
    }]
    // console.log("messages:", messages);
    return openai.chat.completions.create({
        model: 'gpt-4o',
        messages: messages,
    })
}

export const main = async () => {
    const messages: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: CONVERSATION_PROMPT,
    }];

    // Initialize the conversation
    let response = await get_chat_completion(messages);
    let responseText = response.choices[0]?.message?.content;
    console.log("assistantResponse:", responseText);
    if (responseText !== 'OK') {
        console.error('Failed to initialize the conversation. Exiting...');
        process.exit(1);
    }

    messages.push({
        role: 'assistant',
        content: responseText
    }, {
        role: "user",
        content: "인사하시오"
    });
    
    // Start the conversation
    response = await get_chat_completion(messages);
    responseText = response.choices[0]?.message?.content;
    console.log("bot:", responseText);
    messages.push({
        role: 'assistant',
        content: responseText
    });

    let endConversation = false;
    // 남성커트 가격은?

    do {
        const userResponse = await question('You: ');
        if (userResponse === 'exit') {
            console.log('Exiting...');
            process.exit(0);
        }
        
        messages.push({
            role: 'user',
            content: userResponse
        });
    
        let intentResponse = await get_intent_detection([messages.at(-1)!]);
        
        console.log("intent:", intentResponse.choices[0]?.message?.content);
    
        const intent: string|null = intentResponse.choices[0]?.message?.content;
    
        switch (intent) {
            case 'GREETING':
                console.log("Intent Detected: GREETING");
                break;
            case 'RESERVATION_DATE_ENQUERY':
                console.log("Intent Detected: RESERVATION_DATE_ENQUERY");
    
                const timeslots = await itemApi.getAllAvailableTimeSlots();
                // console.log("Items:", items);
                messages.push({
                    role: 'system',
                    content: `Available items are ${JSON.stringify(timeslots)}`
                });
                messages.push({
                    role: 'user',
                    content: `Answer the list of timeslots of customer asked date. Do not use JSON response, response as a plain converation. and End the converation`
                });
                break;
            case 'ITEM_PRICE_ENQUERY':
                console.log("Intent Detected: ITEM_PRICE_ENQUERY");
                const items = await itemApi.getAllItems();
                // console.log("Items:", items);
                messages.push({
                    role: 'system',
                    content: `Available items are ${JSON.stringify(items)}`
                });
                messages.push({
                    role: 'user',
                    content: `Answer the price of the item. Do not use JSON response, response as a plain converation. Response should include {id} {image}. and End the converation`
                });
                break;
            case 'OUT_OF_CONTEXT':
                console.log("Intent Detected: OUT_OF_CONTEXT");
                console.log("Unsupported Intent. Exiting...");
                break;
            case 'END_CONVERSATION':
                console.log("Intent Detected: END_CONVERSATION");
                messages.push({
                    role: 'user',
                    content: "End the conversation"
                })
                endConversation = true;
                break;
            default:
                console.error("Intent Detection Failed.");
                break;
        }

        response = await get_chat_completion(messages);
        responseText = response.choices[0]?.message?.content;
        console.log('bot:', responseText);
    } while (!endConversation);
}

main().catch(console.error).finally(() => {
    rl.close();
});