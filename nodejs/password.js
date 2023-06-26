const crypto = require('crypto')

const length = Number(process.argv[2])

console.log(crypto.randomBytes(length).toString('hex'))

