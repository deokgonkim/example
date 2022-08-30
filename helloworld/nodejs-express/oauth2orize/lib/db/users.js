const config = require('../config')
const ddb = require('../dynamodb')

const TABLE_NAME = `${config.APP_ID}-Users-${config.STAGE}`

// const users = [
//   { id: '1', username: 'bob', password: 'secret', name: 'Bob Smith' },
//   { id: '2', username: 'joe', password: 'password', name: 'Joe Davis' },
// ];

module.exports.findById = async (id, done) => {
  const found = await ddb.findByPk('id', id, TABLE_NAME)
  if (found) return done(null, found)
  return done(new Error('User Not Found'))
};

module.exports.findByUsername = async (username, done) => {
  const found = await ddb.findAllFromTable({'username': username}, TABLE_NAME)
  if (found) return done(null, found[0])
  return done(new Error('User Not Found'))
};
