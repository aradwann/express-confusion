const express = require("express");

const dishRouter = express.Router();
const Dish = require("../models/dish.js");
const authenticate = require("../authenticate");

dishRouter
  .route("/")
  .get((req, res, next) => {
    Dish.find({})
      .populate("comments.author")
      .then((dishes) => {
        res.statusCode = 200;
        res.json(dishes);
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dish.create(req.body)
      .then((dish) => {
        console.log("Dish created", dish);
        res.statusCode = 201;
        res.json(dish);
      })
      .catch((err) => {
        next(err);
      });
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /dishes");
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dish.deleteMany({})
      .then((resp) => {
        res.statusCode = 200;
        res.json(resp);
      })
      .catch((err) => {
        next(err);
      });
  });

dishRouter
  .route("/:dishId")
  .get((req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate("comments.author")
      .then((dish) => {
        res.statusCode = 200;
        res.json(dish);
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /dishes/" + req.params.dishId);
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Dish.findByIdAndUpdate(req.params.dishId, { $set: req.body }, { new: true })
      .then((dish) => {
        res.statusCode = 200;
        res.json(dish);
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dish.findByIdAndDelete(req.params.dishId)
      .then((resp) => {
        res.statusCode = 200;
        res.json(resp);
      })
      .catch((err) => {
        next(err);
      });
  });

dishRouter
  .route("/:dishId/comments")

  .get((req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate("comments.author")
      .then((dish) => {
        if (dish) {
          res.statusCode = 200;
          res.json(dish.comments);
        } else {
          let err = new Error(`Dish ${req.params.dishId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          req.body.author = req.user._id; // set the req.body author to user id that's set by passport JWT
          dish.comments.push(req.body);
          dish
            .save()
            .then((dish) => {
              Dish.findById(dish._id)
                .populate("comments.author")
                .then((dish) => {
                  res.statusCode = 200;
                  res.json(dish);
                });
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let err = new Error(`Dish ${req.params.dishId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /dishes/${req.params.dishId}/comments`
    );
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish) {
          for (var i = dish.comments.length - 1; i >= 0; i--) {
            dish.comments.id(dish.comments[i]._id).remove();
          }
          dish
            .save()
            .then((dish) => {
              res.statusCode = 200;
              res.json(dish);
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let err = new Error(`Dish ${req.params.dishId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  });

dishRouter
  .route("/:dishId/comments/:commentId")
  .get((req, res, next) => {
    Dish.findById(req.params.dishId)
      .populate("comments.author")
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          res.statusCode = 200;
          res.json(dish.comments.id(req.params.commentId));
        } else {
          let err;
          if (!dish) {
            err = new Error(`Dish ${req.params.dishId} not found`);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
          }
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /dishes/${req.params.dishId}/comments/${req.params.commentId}`
    );
  })

  .put(authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          if (req.body.rating) {
            dish.comments.id(req.params.commentId).rating = req.body.rating;
          }
          if (req.body.comment) {
            dish.comments.id(req.params.commentId).comment = req.body.comment;
          }
          dish
            .save()
            .then((dish) => {
              Dish.findById(dish._id)
                .populate("comments.author")
                .then((dish) => {
                  res.statusCode = 200;
                  res.json(dish);
                });
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let err;
          if (!dish) {
            err = new Error(`Dish ${req.params.dishId} not found`);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
          }
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Dish.findById(req.params.dishId)
      .then((dish) => {
        if (dish && dish.comments.id(req.params.commentId)) {
          dish.comments.id(req.params.commentId).remove();
          dish
            .save()
            .then((dish) => {
              res.statusCode = 200;
              res.json(dish);
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let err;
          if (!dish) {
            err = new Error(`Dish ${req.params.dishId} not found`);
          } else {
            err = new Error(`Comment ${req.params.commentId} not found`);
          }
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = dishRouter;
