
/**
 * Read input from the user
 * using readline
 */
const question = async (question) => {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            resolve(answer);
            readline.close();
        });
    });
}

module.exports = {
    question,
}
