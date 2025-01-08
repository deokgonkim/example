const axios = require('axios');
const fs = require('fs');

const model = 'gpt-4o';

const openai = axios.create({
    baseURL: 'https://api.openai.com',
    headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    }
});

const completion = async (content, output) => {
    const answer = [];
    const response = await openai.post('/v1/chat/completions', {
        model,
        messages: [{
            role: 'user',
            content,
        }],
        stream: true,
    }, {
        responseType: 'stream',
    });

    // file stream to write the response
    const fileStream = fs.createWriteStream(output);

    // response.data.on('data', (chunk) => {
    //     // write the chunk to file stream
    //     fileStream.write(chunk);
    //     console.log(chunk.toString());
    // });
    for await (const chunk of response.data) {
        // write the chunk to file stream
        fileStream.write(chunk);
        const text = chunk.toString().trim();
        // console.log('chunk size:', chunk.length);
        if (!text.startsWith('data: ')) {
            console.error(text);
            throw new Error('Invalid chunk');
        }
        const payloads = text.split('data: ');
        // console.log('payloads:', payloads);
        payloads.map((payload) => {
            if (payload.trim().length == 0 || payload == '[DONE]') {
                return;
            }
            try {
                const parsed = JSON.parse(payload);
                const word = parsed?.choices?.[0]?.delta?.content;
                console.log('word:', word);
                answer.push(parsed?.choices?.[0]?.delta?.content);
            } catch (error) {
                console.error('Invalid JSON:', payload);
                // throw error;
            }
        });
        if (payloads.find((payload) => payload == '[DONE]')) {
            console.log('DONE');
        }
        // console.log(chunk.toString());
    }
    return answer.join('');
}

module.exports = {
    completion,
}
