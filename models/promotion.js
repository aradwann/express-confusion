const mongoose = require('mongoose')
const Schema = mongoose.Schema

const promotionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },

    image: {
      type: String,
      required: true
    },

    label: {
      type: String,
      default: ''
    },

    price: {
      type: Number,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
    // toJSON: { getters: true  }, // activates the getter in the json response
  }
)

const Promotion = mongoose.model('Promotion', promotionSchema)

module.exports = Promotion
