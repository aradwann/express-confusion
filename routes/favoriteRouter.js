const express = require("express");

const favoriteRouter = express.Router();
const Favorite = require("../models/favorite.js");
const authenticate = require("../authenticate");
const cors = require("./cors");

/////////////////// helpers //////////////////////////////
// a function to save and send facvorite document as json
function saveFavAndSendJSON(favorite, res, next) {
  favorite
    .save()
    .then((favorite) => {
      res.statusCode = 200;
      res.json(favorite);
    })
    .catch((err) => {
      next(err);
    });
}
// a function to push unique dishes to favorites dish array from request body array that carries the dishes ids
function pushUniqueDishes(req, res, next, favorite) {
  for (const dish of req.body) {
    // push only unique dish ids to the favorite.dishes array (dubdocument)
    if (favorite.dishes.indexOf(dish._id) === -1) {
      favorite.dishes.push(dish._id);
    }
  }
  saveFavAndSendJSON(favorite, res, next);
}

// a function to push unique dish to favorite dish array from request params.dishId

function pushUniqueDish(req, res, next, favorite) {
  // push only unique dish ids to the favorite.dishes array (dubdocument)
  if (favorite.dishes.indexOf(req.params.dishId) === -1) {
    favorite.dishes.push(req.params.dishId);
  }
  saveFavAndSendJSON(favorite, res, next);
}

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then((favorite) => {
        if (favorite) {
          res.statusCode = 200;
          res.json(favorite);
        } else {
          res.statusCode = 404;
          res.json({ message: "you have no favorite dishes" });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          pushUniqueDishes(req, res, next, favorite);
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              pushUniqueDishes(req, res, next, favorite);
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndRemove({ user: req.user._id })
      .then((resp) => {
        if (resp) {
          res.statusCode = 200;
          res.json({ message: "deleted all the favorite dishes successfully" });
        } else {
          res.statusCode = 404;
          res.json({ message: "no favorite dishes found to delete" });
        }
      })
      .catch((err) => {
        next(err);
      });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          pushUniqueDish(req, res, next, favorite);
        } else {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              pushUniqueDish(req, res, next, favorite);
            })
            .catch((err) => {
              next(err);
            });
        }
      })
      .catch((err) => {
        next(err);
      });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite && favorite.dishes.indexOf(req.params.dishId) !== -1) {
          favorite.dishes.splice(favorite.dishes.indexOf(req.params.dishId), 1);
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.json(favorite);
            })
            .catch((err) => {
              next(err);
            });
        } else {
          let err;
          if (!favorite) {
            err = new Error(`you have no favorite dishes`);
          } else {
            err = new Error(
              `the dish ${req.params.dishId} not found in your favorites`
            );
          }
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = favoriteRouter;
