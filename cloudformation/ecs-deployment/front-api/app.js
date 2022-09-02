const express = require('express')
const app = express()
const port = 3000

require('dotenv').config({
    path: './.env'
})

const env = {
    STAGE: process.env.STAGE,
    RDS_HOSTNAME: process.env.RDS_HOSTNAME
}

app.get('/', (req, res) => {
  res.send(`Hello World!\nEnvironment\n${JSON.stringify(env)}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
