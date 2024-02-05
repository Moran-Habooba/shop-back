const mongoose = require("mongoose");
const Joi = require("joi");

const inventorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantityInStock: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  image_file: {
    path: String,
    originalname: String,
  },
});

const InventoryItem = mongoose.model(
  "InventoryItem",
  inventorySchema,
  "Inventory"
);

const validateInventoryItem = (item) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(""),
    price: Joi.number().required(),
    quantityInStock: Joi.number().min(0).required(),
    category: Joi.string().required(),
    image_file: Joi.any().optional(),
  });

  return schema.validate(item);
};

module.exports = {
  InventoryItem,
  validateInventoryItem,
};
