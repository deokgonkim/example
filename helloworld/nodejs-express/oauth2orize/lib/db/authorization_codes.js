const config = require('../config')
const ddb = require('../dynamodb')

const TABLE_NAME = `${config.APP_ID}-OAuth2-AuthorizationCodes-${config.STAGE}`

module.exports.find = async (key, done) => {
  const found = await ddb.findByPk('id', key, TABLE_NAME)
  if (found) return done(null, found)
  return done(new Error('Code Not Found'))
};

module.exports.save = async (code, clientId, redirectUri, userId, userName, done) => {
  await ddb.insertItem(
    TABLE_NAME,
    {
      id: code,
      clientId,
      redirectUri,
      userId,
      userName
    }
  )
  // codes[code] = { clientId, redirectUri, userId, userName }
  done();
};
