var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

var User = mongoose.model("User", userSchema);

module.exports = User;
