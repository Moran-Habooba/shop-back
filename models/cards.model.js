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
  subtitle: {
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
  phone: {
    type: String,
    required: true,
    match: RegExp(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/),
  },
  email: {
    type: String,
    required: true,
    match: RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/),
    lowercase: true,
    trim: true,
    unique: false,
  },
  web: {
    type: String,
    match: RegExp(
      /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
    ),
    trim: true,
    lowercase: true,
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

  likes: [String],
  image: imageSchema,
  address: addressSchema,
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
    title: Joi.string().min(2).max(256).required(),
    subtitle: Joi.string().min(2).max(256).required(),
    description: Joi.string().min(2).max(1024).required(),
    phone: Joi.string()
      .pattern(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/)
      .rule({ message: 'card "phone" mast be a valid phone number' })
      .required(),
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)
      .message("card mail mast be a valid mail")
      .required(),
    web: Joi.string()
      .pattern(
        /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
      )
      .message('card "web" mast be a valid url')
      .allow(""),
    image: Joi.object({
      url: Joi.string()
        .uri()
        .allow("")
        .pattern(
          /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
        ),
      alt: Joi.string().min(2).max(255).allow(""),
    }).required(),
    address: Joi.object({
      country: Joi.string().min(2).max(255),
      city: Joi.string().min(2).max(255),
      street: Joi.string().min(2).max(255),
      houseNumber: Joi.number().min(1).max(50),
      zip: Joi.number().min(1).max(500),
    }).required(),
    bizNumber: Joi.number().allow(""),
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
