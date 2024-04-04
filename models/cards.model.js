const mongoose = require("mongoose");
const Joi = require("joi");

const cardsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 256,
    trim: true,
    lowercase: true,
  },

  description: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 1024,
    trim: true,
    lowercase: true,
  },
  price: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 9999,
  },

  bizNumber: {
    type: Number,
    minLength: 7,
    maxLength: 7,
    required: true,
    trim: true,
  },

  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  image_file: {
    path: String,
    originalname: String,
  },

  likes: [String],

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  quantity: {
    type: Number,
    min: 0,
    required: true,
    default: 5,
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
});

const Card = mongoose.model("Card", cardsSchema, "cards");

function validateCard(card) {
  const schema = Joi.object({
    likes: Joi.array().items(Joi.string()).optional(),

    title: Joi.string().min(2).max(256).required(),
    description: Joi.string().min(2).max(1024).required(),
    price: Joi.string()
      .required()
      .custom((value, helpers) => {
        let numberValue = Number(value.replace(/₪|,|\./g, ""));
        if (numberValue < 0) {
          return helpers.error("any.invalid");
        }
        return value;
      }),

    bizNumber: Joi.number().allow(""),
    image_file: Joi.any().optional(),
    user_id: Joi.string().allow(""),
    quantity: Joi.number().min(0).optional(),

    category: Joi.string().required().trim().lowercase(),
  });
  return schema.validate(card);
}
module.exports = {
  Card,
  validateCard,
};
