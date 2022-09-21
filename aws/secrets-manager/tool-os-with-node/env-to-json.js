#!/usr/bin/env node

const fs = require('fs')
const dotenv = require('dotenv')

if (process.argv.length != 3) {
    console.log(`Usage: ./env-to-json.js ENV_FILE_NAME`)
    process.exit(1)
}

const parsed = dotenv.config({
    path: process.argv[2]
}).parsed

console.log(JSON.stringify(parsed, null, 4))
