const oauth2orize = require('oauth2orize')
const { AuthorizationCode } = require('oauth2orize')

const server = oauth2orize.createServer()


server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  var code = utils.uid(16)

  var ac = new AuthorizationCode(code, client.id, redirectURI, user.id, ares.scope);
  ac.save((err) => {
    if (err) { return done(err) }
    return done(null, code)
  })
}))

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  AuthorizationCode.findOne(code, function(err, code) {
    if (err) { return done(err) }
    if (client.id !== code.clientId) { return done(null, false) }
    if (redirectURI !== code.redirectUri) { return done(null, false) }

    var token = utils.uid(256);
    var at = new AccessToken(token, code.userId, code.clientId, code.scope)
    at.save(function(err) {
      if (err) { return done(err) }
      return done(null, token)
    })
  })
}))