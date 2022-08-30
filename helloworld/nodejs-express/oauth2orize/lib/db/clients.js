const config = require('../config')
const ddb = require('../dynamodb')

const TABLE_NAME = `${config.APP_ID}-OAuth2-Clients-${config.STAGE}`

// const clients = [
//   { id: '1', name: 'Samplr', clientId: 'abc123', clientSecret: 'ssh-secret', isTrusted: false },
//   { id: '2', name: 'Samplr2', clientId: 'xyz123', clientSecret: 'ssh-password', isTrusted: true },
// ];

module.exports.findById = async (id, done) => {
  // for (let i = 0, len = clients.length; i < len; i++) {
  //   if (clients[i].id === id) return done(null, clients[i]);
  // }
  // return done(new Error('Client Not Found'));
  const found = await ddb.findByPk('id', id, TABLE_NAME)
  if (found) return done(null, found);
  return done(new Error('Client Not Found'));
};

module.exports.findByClientId = async (clientId, done) => {
  // for (let i = 0, len = clients.length; i < len; i++) {
  //   if (clients[i].clientId === clientId) return done(null, clients[i]);
  // }
  // return done(new Error('Client Not Found'));
  const found = await ddb.findAllFromTable({
    clientId: clientId
  }, TABLE_NAME)
  console.log(`Client found ${JSON.stringify(found[0])}`)
  if (found[0]) return done(null, found[0])
  return done(new Error('Client Not Found'));
};
