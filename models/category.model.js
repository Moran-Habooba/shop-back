const mongoose = require("mongoose");
const Joi = require("joi");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
});

const Category = mongoose.model("Category", categorySchema, "categories");

function validateCategory(category) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().trim().lowercase(),
  });

  return schema.validate(category);
}

module.exports = { Category, validateCategory };
