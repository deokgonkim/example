
const sleep = require('./lib/utils').sleep

const main = async () => {
    console.log("Running server ...")
    while (true) {
        console.log("Tick")
        await sleep(1000)
    }
}

module.exports = {
    main
}

if (require.main === module) {
    main()
}
