const readline = require('readline');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

/**
 * 
 * @param {string} question 
 * @returns 
 */
const question = async (question) => {
    return new Promise((resolve, reject) => {
        rl.question(question, (code) => {
            rl.close();
            resolve(code);
        });
    });
}

module.exports = {
    question
}
