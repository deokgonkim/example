import readline from 'readline';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const SHOP_NAME = process.env.SHOP_NAME;
const SHOP_API_ENDPOINT = process.env.SHOP_API_ENDPOINT;

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

export const get_chat_completion = async (
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-4o' // 'gpt-3.5-turbo'
) => {
    return openai.chat.completions.create({
        messages: messages,
        model // 'gpt-4o',
    });
}

export const main = async () => {
    const messages: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: `You will be asked about ${SHOP_NAME} shop.
        You can get informations from API Endpoint.
        API Endpoint is ${SHOP_API_ENDPOINT}
        You can answer what time is available using "shopAvailableTimeslots".
        You can answer what items are on sale.
        You can answer must-read items using "shopGuides" item.
        `
    }, {
        role: 'user',
        content: `Learn about ${SHOP_NAME} shop. and answer what user asks.`
    }]
    const initialResponse = await get_chat_completion(messages);
    const assistantResponse = initialResponse.choices[0]?.message?.content;
    console.log("assistantResponse:", assistantResponse);

    messages.push({
        role: 'assistant',
        content: assistantResponse
    });

    while (true) {
        const userResponse = await question('You: ');
        if (userResponse === 'exit') {
            break;
        }
        
        messages.push({
            role: 'user',
            content: userResponse
        });

        let nextResponse = await get_chat_completion(messages);
        messages.push({
            role: 'assistant',
            content: nextResponse.choices[0]?.message?.content
        });
        
        console.log("assistantResponse:", nextResponse.choices[0]?.message?.content);
    }
}

main().catch(console.error).finally(() => {
    rl.close();
});