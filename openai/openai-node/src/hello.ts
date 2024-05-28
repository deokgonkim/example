import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

export const main = async () => {
    const completion = await openai.chat.completions.create({
        messages: [{
            role: 'system',
            content: 'You are a helpful assistant.'
        }],
        model: 'gpt-3.5-turbo' // 'gpt-4o',
    });
    console.log(completion.choices[0]);
}

main().catch(console.error);
