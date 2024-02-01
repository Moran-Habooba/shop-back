const mongoose = require("mongoose");
const Joi = require("joi");
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    enum: ["pending", "completed", "cancelled", "close"],
    default: "pending",
  },

  items: [
    {
      card_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
        required: true,
      },
      // title: {
      //   type: String,
      //   required: true,
      //   minLength: 2,
      //   maxLength: 256,
      //   trim: true,
      //   lowercase: true,
      // },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

const Order = mongoose.model("Order", orderSchema, "Orders");

const validateOrder = (order) => {
  const schema = Joi.object({
    user_id: Joi.string().allow(""),
    orderNumber: Joi.string().min(5).max(5).required(),

    status: Joi.string()
      .valid("pending", "close", "cancelled", "completed")
      .default("pending"),
    items: orderedItems.map((item) => ({
      card_id: item.card_id._id,
      // title: item.card_id.title,
      quantity: item.quantity,
    })),
  });

  return schema.validate(order);
};

module.exports = {
  Order,
  validateOrder,
};
