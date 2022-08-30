const config = require('../config')
const ddb = require('../dynamodb')

const TABLE_NAME = `${config.APP_ID}-OAuth2-RefreshTokens-${config.STAGE}`

module.exports.find = async (key, done) => {
    const found = await ddb.findByPk('id', key, TABLE_NAME)
    if (found) return done(null, found)
    return done(new Error('Token Not Found'))
};

module.exports.findByUserIdAndClientId = async (userId, clientId, done) => {
    // for (const token in tokens) {
    //     if (tokens[token].userId === userId && tokens[token].clientId === clientId) return done(null, token)
    // }
    // return done(new Error('Token Not Found'))
    const found = await ddb.findAllFromTable({
        userId: userId,
        clientId: clientId
      }, TABLE_NAME)
    if (found) done(null, found.token)    
    return done(new Error('Token Not Found'))
};

module.exports.save = async (token, userId, clientId, done) => {
    // tokens[token] = { userId, clientId }
    await ddb.insertItem(TABLE_NAME, {
        id: token,
        userId,
        clientId,
    })
    done()
}

module.exports.removeByUserIdAndClientId = async (userId, clientId, done) => {
    // for (const token in tokens) {
    //     if (tokens[token].userId === userId && tokens[token].clientId === clientId) {
    //         delete tokens[token]
    //         return done(null)
    //     }
    // }
    // return done(new Error('Token Not Found'))
    return done(new Error('Not implemented yet'))
}