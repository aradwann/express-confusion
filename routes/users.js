var express = require("express");
var router = express.Router();
const User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.post("/signup", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.json({ err: err });
      } else {
        if (req.body.name.first) user.name.first = req.body.name.first;
        if (req.body.name.last) user.name.last = req.body.name.last;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 201;
            res.json({ success: true, status: "Registration Successful!" });
          });
        });
      }
    }
  );
});

router.post("/login", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.json({
    success: true,
    token: token,
    status: "You are successfully logged in!",
  });
});

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.json({ success: true, message: "logged out successfully" });
  } else {
    var err = new Error("you are not logged in");
    err.status = 403;
    next(err);
  }
});

module.exports = router;
