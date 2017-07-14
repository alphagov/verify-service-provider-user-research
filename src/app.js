const express = require('express')
const session = require('express-session')
const passport = require('passport')
const passportLocal = require('passport-local')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const LocalStrategy = require('passport-local')

module.exports = function createApp (users) {
  const app = express()

  nunjucks.configure([
    './src/views',
    './node_modules/govuk_template_jinja/views'
  ], {
    autoescape: true,
    express: app
  }).addGlobal('asset_path', '/')

  app.use(express.static('./src/assets'))
  app.use(express.static('./node_modules/govuk_template_jinja/assets'))

  app.use(bodyParser.urlencoded({extended: false}))
  app.use(session({
    secret: 'maximum security keyboard cat',
    resave: true,
    saveUninitialized: true
  }))
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(new LocalStrategy(
    function verifyUser(username, password, done) {
      if (users[username] && users[username].password === password) {
        return done(null, users[username])
      } else {
        return done(null, false)
      }
    }
  ))

  // Define how the user-object is de/serialized into the session
  // so that it is available across requests
  // this could a db for a session store instead of serializing the whole user-object into the session
  passport.serializeUser((user, done) => done(null, JSON.stringify(user)))
  passport.deserializeUser((user, done) => done(null, JSON.parse(user)))

  const redirectIfNoSession = (req, res, next) => {
    if (!req.user) res.redirect('/')
    else next()
  }

  app.get('/', (req, res) => res.render('index.njk'))

  app.post('/authenticate', passport.authenticate('local', {
    failureRedirect: '/authentication-failed-page',
    successRedirect: '/service-landing-page'
  }))

  app.get('/service-landing-page', (req, res) => {
    res.render('service-landing-page.njk', { user: req.user })
  })

  app.get('/authentication-failed-page', (req, res) => {
    res.render('authentication-failed-page.njk', { error: 'Bad username or password'})
  })

  return app
}
