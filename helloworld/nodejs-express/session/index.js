const express = require('express')
const cookieParser = require('cookie-parser')
const sessions = require('express-session')

const { authenticate } = require('./lib/auth')

const app = express()
const port = 3000

if (process.env.NODE_ENV == 'local') {
  require('dotenv').config({
    path: './.env'
  })
}

const SESSION_SECRET = process.env.SESSION_SECRET
const SESSION_DURATION = Number(process.env.SESSION_DURATION || 86400000) // default session_duration is one day


// setup express-cookie
app.use(cookieParser())

// setup `express-session`
app.use(sessions({
  secret: SESSION_SECRET,
  saveUninitialized: true,
  // cookie: { maxAge: SESSION_DURATION },
  resave: false
}))

// setup user request parsing
app.use(express.urlencoded({ extended: true }))

// setup view engine
app.set('view engine', 'pug')


app.get('/', (req, res) => {
  const session = req.session

  console.log(`Session ${JSON.stringify(session, null, 4)}`)
  if (session.userid) {
    // res.sendFile('views/welcome.html', { root: __dirname })
    res.render('welcome', { userid: session.userid })
  } else {
    // res.sendFile('views/index.html', { root: __dirname })
    res.render('index')
  }
})

app.post('/login', (req, res) => {
  console.log(`Received body ${JSON.stringify(req.body)}`)
  if (authenticate(req.body.username, req.body.password)) {
    const session = req.session;
    session.userid = req.body.username;
    console.log(req.session)
    // res.render('welcome', { userid: session.userid })
    res.redirect('/')
  } else {
    res.render('index', { message: 'Invalid username or password' })
  }
})

app.get('/logout', (req, res) => {
  const session = req.session
  session.destroy()
  res.redirect('/')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
