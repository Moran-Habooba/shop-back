const mongoose = require("mongoose");
const Joi = require("joi");
const imageSchema = require("./imageSchema");
const addressSchema = require("./addressSchema");

const cardsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minLength: 2,
    maxLength: 256,
    trim: true,
    lowercase: true,
  },
  // subtitle: {
  //   type: String,
  //   required: false,
  //   minLength: 2,
  //   maxLength: 256,
  //   trim: true,
  //   lowercase: true,
  // },
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
    match: RegExp(/^\₪?\d{1,3}(,\d{3})*(\.\d{2})?$/),
    minLength: 1,
    maxLength: 9999,
  },

  // phone: {
  //   type: String,
  //   required: true,
  //   match: RegExp(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/),
  // },
  // email: {
  //   type: String,
  //   required: true,
  //   match: RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
  //   lowercase: true,
  //   trim: true,
  //   unique: false,
  // },
  // web: {
  //   type: String,
  //   match: RegExp(
  //     /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
  //   ),
  //   trim: true,
  //   lowercase: true,
  // },

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
  // image: imageSchema,
  // address: addressSchema,
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
    // subtitle: Joi.string().min(2).max(256).optional(),
    description: Joi.string().min(2).max(1024).required(),
    price: Joi.string()
      .pattern(/^\₪?\d{1,3}(,\d{3})*(\.\d{2})?$/)
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
