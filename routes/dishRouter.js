const express = require('express')

const dishRouter = express.Router()
const Dish = require('../models/dish.js')
const authenticate = require('../authenticate')
const cors = require('./cors')

dishRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.cors, (req, res, next) => {
    Dish.find({})
      .populate('comments.author')
      .then((dishes) => {
        res.statusCode = 200
        res.json(dishes)
      })
      .catch((err) => {
        next(err)
      })
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dish.create(req.body)
        .then((dish) => {
          console.log('Dish created', dish)
          res.statusCode = 201
          res.json(dish)
        })
        .catch((err) => {
          next(err)
        })
    }
  )
  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403
      res.end('PUT operation not supported on /dishes')
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dish.deleteMany({})
        .then((resp) => {
          res.statusCode = 200
          res.json(resp)
        })
        .catch((err) => {
          next(err)
        })
    }
  )

dishRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.cors, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        res.statusCode = 200
        res.json(dish)
      })
      .catch((err) => {
        next(err)
      })
  })
  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      res.statusCode = 403
      res.end('POST operation not supported on /dishes/' + req.params.dishId)
    }
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dish.findByIdAndUpdate(
        req.params.dishId,
        { $set: req.body },
        { new: true }
      )
        .then((dish) => {
          res.statusCode = 200
          res.json(dish)
        })
        .catch((err) => {
          next(err)
        })
    }
  )
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dish.findByIdAndDelete(req.params.dishId)
        .then((resp) => {
          res.statusCode = 200
          res.json(resp)
        })
        .catch((err) => {
          next(err)
        })
    }
  )

dishRouter
  .route('/:dishId/comments')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.cors, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish) {
          res.statusCode = 200
          res.json(dish.comments)
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          req.body.author = req.user._id // set the req.body author to user id that's set by passport JWT
          dish.comments.push(req.body)
          dish
            .save()
            .then((dish) => {
              Dish.findById(dish._id)
                .populate('comments.author')
                .then((dish) => {
                  res.statusCode = 200
                  res.json(dish)
                })
            })
            .catch((err) => {
              next(err)
            })
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishId}/comments`
    )
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          for (let i = dish.comments.length - 1; i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove()
          }
          dish
            .save()
            .then((dish) => {
              res.statusCode = 200
              res.json(dish)
            })
            .catch((err) => {
              next(err)
            })
        } else {
          const err = new Error(`Dish ${req.params.dishId} not found`)
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })

dishRouter
  .route('/:dishId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
  })
  .get(cors.cors, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate('comments.author')
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          res.statusCode = 200
          res.json(dish.comments.id(req.params.commentId))
        } else {
          let err
          if (!dish) {
            err = new Error(`Dish ${req.params.dishId} not found`)
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`)
          }
          err.status = 404
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403
    res.end(
      `POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`
    )
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        const userId = req.user._id
        const authorId = dish.comments.id(req.params.commentId).author
        if (userId.equals(authorId)) {
          if (dish && dish.comments.id(req.params.commentId)) {
            if (req.body.rating) {
              dish.comments.id(req.params.commentId).rating = req.body.rating
            }
            if (req.body.comment) {
              dish.comments.id(req.params.commentId).comment = req.body.comment
            }
            dish
              .save()
              .then((dish) => {
                Dish.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200
                    res.json(dish)
                  })
              })
              .catch((err) => {
                next(err)
              })
          } else {
            let err
            if (!dish) {
              err = new Error(`Dish ${req.params.dishId} not found`)
            } else {
              err = new Error(`Comment ${req.params.commentId} not found`)
            }
            err.status = 404
            return next(err)
          }
        } else {
          const err = new Error('only comment author can update it!')

          err.status = 403
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        const userId = req.user._id
        const authorId = dish.comments.id(req.params.commentId).author
        if (userId.equals(authorId)) {
          if (dish && dish.comments.id(req.params.commentId)) {
            dish.comments.id(req.params.commentId).remove()
            dish
              .save()
              .then((dish) => {
                res.statusCode = 200
                res.json(dish)
              })
              .catch((err) => {
                next(err)
              })
          } else {
            let err
            if (!dish) {
              err = new Error(`Dish ${req.params.dishId} not found`)
            } else {
              err = new Error(`Comment ${req.params.commentId} not found`)
            }
            err.status = 404
            return next(err)
          }
        } else {
          const err = new Error('only comment author can delete it!')

          err.status = 403
          return next(err)
        }
      })
      .catch((err) => {
        next(err)
      })
  })

module.exports = dishRouter
