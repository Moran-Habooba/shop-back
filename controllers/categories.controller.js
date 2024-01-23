const { Category, validateCategory } = require("../models/category.model");
const { Card } = require("../models/cards.model");

const addCategory = async (req, res) => {
  const { error } = validateCategory(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    // if (!req.user.isAdmin) {
    //   return res
    //     .status(403)
    //     .send("Permission denied. Only admins can add categories.");
    // }

    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      return res.status(400).send("Category already exists.");
    }

    let category = new Category({ name: req.body.name });
    category = await category.save();
    res.status(201).send(category);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("name");
    res.send(categories);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

const removeCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).send("Category not found.");
    }
    res.status(200).send(category);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};
const getProductsCountInCategory = async (req, res) => {
  try {
    const categoryName = req.params.categoryName;

    const products = await Card.find({ category: categoryName });

    const productsCount = products.length;

    res.send({ count: productsCount, products: products });
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

module.exports = {
  addCategory,
  removeCategory,
  getAllCategories,
  getProductsCountInCategory,
};
