import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// const SHOP_NAME = process.env.SHOP_NAME;
const SHOP_API_ENDPOINT = process.env.SHOP_API_ENDPOINT;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

export const get_chat_completion = async (
    messages: ChatCompletionMessageParam[],
    model: string = 'gpt-3.5-turbo'
) => {
    return openai.chat.completions.create({
        messages: messages,
        model // 'gpt-4o',
    });
}

export const main = async () => {
    // const completion = await openai.chat.completions.create({
    //     messages: [{
    //         role: 'system',
    //         content: `You will be asked about available time slot for reservation.
    //         You can get available time slots using http api call.
    //         API Endpoint is ${SHOP_API_ENDPOINT}/schedule/available_timeslots/`
    //     }, {
    //         role: 'user',
    //         content: 'What time is available tomorrow?'
    //     }],
    //     model: 'gpt-3.5-turbo' // 'gpt-4o',
    // });

    const initialMessages: ChatCompletionMessageParam[] = [{
        role: 'system',
        content: `You will be asked about available time slot for reservation.
        You can get available time slots using http api call.
        API Endpoint is ${SHOP_API_ENDPOINT}/schedule/available_timeslots/`
    }, {
        role: 'user',
        content: 'What time is available tomorrow?'
    }]
    const initialResponse = await get_chat_completion(initialMessages);
    const assistantResponse = initialResponse.choices[0]?.message?.content;

    const newMessages: ChatCompletionMessageParam[] = [{
        role: 'assistant',
        content: assistantResponse
    }, {
        role: 'user',
        content: 'go ahead'
    }];

    const nextResponse = await get_chat_completion(newMessages);

    console.log(nextResponse.choices[0]);
}

main().catch(console.error);
