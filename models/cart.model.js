const Joi = require("joi");
const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  status: {
    type: String,
    default: "pending",
    enum: ["pending", "closed", "cancelled", "completed"],
  },
  items: [
    {
      card_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
      quantity: Number,
    },
  ],
});

const Cart = mongoose.model("Cart", cartSchema, "carts");

const validateCart = (cart) => {
  const schema = Joi.object({
    user_id: Joi.string().allow(""),

    status: Joi.string()
      .valid("pending", "closed", "cancelled", "completed")
      .default("pending"),
    items: Joi.array().items(
      Joi.object({
        card_id: Joi.string().required(),
        quantity: Joi.number().required(),
      })
    ),
  });

  return schema.validate(cart);
};

module.exports = {
  Cart,
  validateCart,
};
