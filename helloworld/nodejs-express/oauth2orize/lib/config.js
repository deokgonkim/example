if (process.env.NODE_ENV == 'local') {
    require('dotenv').config({
        path: './.env'
    })
}

module.exports = {
    APP_ID: process.env.APP_ID,
    STAGE: process.env.STAGE
}
