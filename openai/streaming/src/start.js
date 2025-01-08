const fs = require('fs');
const { question } = require('./lib');
const openai = require('./openai');

const main = async () => {
    const now = Date.now();
    const output = `output/${now}.chunks.txt`;
    const content = await question('What do you want to ask the AI? ');
    const response = await openai.completion(content, output);
    fs.writeFileSync(`output/${now}.txt`, response);
    console.log('response:', response);
}

main().catch(console.error);
