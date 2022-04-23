var mongoose = require("mongoose");
var Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    dishes: [{ type: Schema.Types.ObjectId, ref: "Dish" }],
  },
  {
    timestamps: true,
  }
);

var Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
