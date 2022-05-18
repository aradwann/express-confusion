const createError = require('http-errors')
const express = require('express')
const path = require('path')
const logger = require('morgan')
const passport = require('passport')
const config = require('./config')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const dishRouter = require('./routes/dishRouter')
const leaderRouter = require('./routes/leaderRouter')
const promoRouter = require('./routes/promoRouter')
const uploadRouter = require('./routes/uploadRouter')
const favoriteRouter = require('./routes/favoriteRouter')

const mongoose = require('mongoose')

const url = config.mongoUrl
console.log(url)
const connect = mongoose.connect(url)
connect
  .then((db) => {
    console.log('connected successfully to the database')
  })
  .catch((err) => {
    console.log(err)
  })

const app = express()

// redirect insecure (http) requests to secure https port
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next()
  } else {
    res.redirect(
      307,
      'https://' + req.hostname + ':' + app.get('secPort') + req.url
    )
  }
})

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(passport.initialize())

app.use('/', indexRouter)
app.use('/users', usersRouter)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/dishes', dishRouter)
app.use('/promotions', promoRouter)
app.use('/leaders', leaderRouter)
app.use('/imageUpload', uploadRouter)
app.use('/favorites', favoriteRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.json(err.message)
})

module.exports = app
