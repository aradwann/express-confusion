var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema(
  {
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(passportLocalMongoose);
var User = mongoose.model("User", userSchema);

module.exports = User;
