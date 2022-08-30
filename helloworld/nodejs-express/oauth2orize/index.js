const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const errorHandler = require('errorhandler');
const passport = require('passport')
const routes = require('./lib/routes')
const path = require('path')

// Express configuration
const app = express();


app.set('view engine', 'pug')
app.set('views', path.join(__dirname, './views'))

// app.use(cookieParser());
app.use(bodyParser.json({ extended: false }))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(errorHandler())
app.use(session({ secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false }))
app.use(passport.initialize())
app.use(passport.session())

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

// Passport configuration
require('./lib/auth')

app.get('/', routes.site.index)
app.get('/login', routes.site.loginForm)
app.post('/login', routes.site.login)
app.get('/logout', routes.site.logout)
app.get('/account', routes.site.account)

app.get('/dialog/authorize', routes.oauth2.authorization)
app.post('/dialog/authorize/decision', routes.oauth2.decision)
app.post('/oauth/token', routes.oauth2.token)

app.get('/api/userinfo', routes.user.info)
app.get('/api/clientinfo', routes.client.info)

// Might have to comment out the line of code below for some serverless environments.
// For example, it will work as is with @now/node-server, but not with @now/node.

// https://zeit.co/docs/v2/deployments/official-builders/node-js-server-now-node-server/
// vs.
// https://zeit.co/docs/v2/deployments/official-builders/node-js-now-node/

app.listen(process.env.PORT || 3000)

// Required for @now/node, optional for @now/node-server.
module.exports = app
