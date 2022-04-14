var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const leaderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
    },
    abbr: {
      type: String,
    },

    description: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

var Leader = mongoose.model("Leader", leaderSchema);

module.exports = Leader;
