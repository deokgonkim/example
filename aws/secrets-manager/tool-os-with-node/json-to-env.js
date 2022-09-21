#!/usr/bin/env node

const fs = require('fs')

const read = fs.readFileSync('/dev/stdin').toString()
const parsed = JSON.parse(read)

const SecretString = JSON.parse(parsed.SecretString)

for (const key in SecretString) {
    console.log(`${key}=${JSON.stringify(SecretString[key])}`)
}
