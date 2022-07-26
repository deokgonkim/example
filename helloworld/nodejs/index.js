
const main = async () => {
    console.log('Hello Worlld')
}

module.exports = {
    main
}


if (require.main === module) {
    main()
}
