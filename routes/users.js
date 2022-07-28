const express = require('express')
const router = express.Router()
const User = require('../models/user')
const passport = require('passport')
const authenticate = require('../authenticate')
const cors = require('./cors')

/* GET users listing. */
router.get(
  '/',
  cors.corsWithOptions,
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  function (req, res, next) {
    User.find({})
      .then((users) => {
        res.statusCode = 200
        res.json(users)
      })
      .catch((err) => {
        next(err)
      })
  }
)

router.post('/signup', cors.corsWithOptions, (req, res, next) => {
  const newUser = new User({ username: req.body.username })

  User.register(
    newUser,
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500
        res.json({ err })
      } else {
        res.statusCode = 201
        res.json({ success: true, status: 'Registration Successful!' })
      }
    }
  )
})

router.post(
  '/login',
  cors.corsWithOptions,
  passport.authenticate('local'),
  (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id })
    res.statusCode = 200
    res.json({
      success: true,
      token,
      status: 'You are successfully logged in!'
    })
  }
)

router.get('/logout', cors.corsWithOptions, (req, res, next) => {
  if (req.session) {
    req.session.destroy()
    res.clearCookie('session-id')
    res.json({ success: true, message: 'logged out successfully' })
  } else {
    const err = new Error('you are not logged in')
    err.status = 403
    next(err)
  }
})

module.exports = router
