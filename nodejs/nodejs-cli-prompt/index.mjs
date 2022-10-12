
import inquirer from "inquirer"

const main = async () => {
    inquirer.prompt([{
        name: 'ans1',
        message: 'Answer first question'
    }, {
        name: 'ans2',
        message: 'Answer second question'
    }, {
        type: 'list',
        name: 'listQuestion',
        choices: ['choice1', 'choice2', 'choice3'],
        message: 'list question'
    }, {
        type: 'confirm',
        name: 'confirm',
        message: 'confirm'
    }]).then((answers) => {
        console.log(JSON.stringify(answers, null, 4))
    })
}

export {
    main
}

main()
