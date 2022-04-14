const express = require("express");
const Promotion = require("../models/promotion.js");

const promotionRouter = express.Router();

promotionRouter.route("/");

promotionRouter.use(express.json());

promotionRouter
  .route("/")
  .get((req, res, next) => {
    Promotion.find({})
      .then((promotions) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotions);
      })
      .catch((err) => {
        next(err);
      });
  })
  .post((req, res, next) => {
    Promotion.create(req.body)
      .then((promo) => {
        console.log("Promotion created", promo);
        res.statusCode = 201;
        res.setHeader("Content-Type", "application/json");
        res.json(promo);
      })
      .catch((err) => {
        next(err);
      });
  })
  .put((req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /Promotiones");
  })
  .delete((req, res, next) => {
    Promotion.deleteMany({})
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      })
      .catch((err) => {
        next(err);
      });
  });

promotionRouter
  .route("/:promotionId")
  .get((req, res, next) => {
    Promotion.findById(req.params.promotionId)
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch((err) => {
        next(err);
      });
  })
  .post((req, res, next) => {
    res.statusCode = 403;
    res.end(
      "POST operation not supported on /promotion/" + req.params.promotionId
    );
  })

  .put((req, res, next) => {
    Promotion.findByIdAndUpdate(
      req.params.promotionId,
      { $set: req.body },
      { new: true }
    )
      .then((promotion) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(promotion);
      })
      .catch((err) => {
        next(err);
      });
  })
  .delete((req, res, next) => {
    Promotion.findByIdAndDelete(req.params.promotionId)
      .then((resp) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(resp);
      })
      .catch((err) => {
        next(err);
      });
  });

module.exports = promotionRouter;
