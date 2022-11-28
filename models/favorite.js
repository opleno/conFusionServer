const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const favoriteSchema = new Schema(
  {
    dishes: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

var Favorite = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorite;
