const openai = require('openai');

const model = 'gpt-4o';

const client = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const complete = async (content) => {
    const stream = await client.chat.completions.create({
        model,
        messages: [{
            role: 'user',
            content
        }],
        stream: true
    });
    return stream;
}

module.exports = {
    complete
}
