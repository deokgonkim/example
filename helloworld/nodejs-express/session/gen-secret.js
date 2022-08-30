#!/usr/bin/env node

// https://stackoverflow.com/questions/58325771/how-to-generate-random-hex-string-in-javascript

const genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')

const secret_key = genRanHex(24)

console.log(`SESSION_SECRET=${secret_key}`)
