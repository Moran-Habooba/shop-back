const { Cart } = require("../models/cart.model");
const Card = require("../models/cards.model");

const addToCart = async (req, res) => {
  try {
    const { card_id, quantity } = req.body;

    if (!req.user) {
      return;
    }

    const user_id = req.user._id;

    let cart = await Cart.findOne({ user_id }).populate({
      path: "items.card_id",
      model: "Card",
    });

    if (cart) {
      const existingItemIndex = cart.items.findIndex(
        (item) => item.card_id._id.toString() === card_id
      );
      if (existingItemIndex >= 0) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ card_id, quantity });
      }
      await cart.save();
    } else {
      cart = new Cart({
        user_id,
        items: [{ card_id, quantity }],
      });
      await cart.save();
    }

    cart = await Cart.findOne({ user_id }).populate({
      path: "items.card_id",
      model: "Card",
    });

    return res.status(200).json({
      message: "The product has been added to the cart successfully",
      cart: cart,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred while adding the product to the cart" });
  }
};

const getCartItems = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not logged in" });
    }

    const user_id = req.user._id;

    const cart = await Cart.findOne({ user_id }).populate({
      path: "items.card_id",
      model: "Card",
    });

    if (!cart) {
      return res.status(400).json({ message: "No cart found" });
    }

    res.status(200).json({ cart: cart });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error occurred while fetching cart items" });
  }
};

const cancelCart = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const user_id = req.user._id;
  const cart = await Cart.findOne({ user_id, status: "pending" });

  if (!cart) {
    return res.status(400).json({ message: "No pending cart found" });
  }

  cart.status = "cancelled";
  await cart.save();

  res.status(200).json({ message: "Cart has been cancelled", cart });
};

const updateCart = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const user_id = req.user._id;
  const { itemsToUpdate } = req.body;

  let cart = await Cart.findOne({ user_id, status: "pending" });

  if (!cart) {
    return res.status(400).json({ message: "No pending cart found" });
  }

  itemsToUpdate.forEach((itemUpdate) => {
    const itemIndex = cart.items.findIndex(
      (item) => item.card_id.toString() === itemUpdate.card_id
    );

    if (itemIndex > -1) {
      if (itemUpdate.quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = itemUpdate.quantity;
      }
    }
  });

  await cart.save();

  cart = await Cart.findOne({ user_id }).populate({
    path: "items.card_id",
    model: "Card",
  });

  res.status(200).json({ message: "Cart updated successfully", cart });
};

const completeOrder = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const user_id = req.user._id;
  const cart = await Cart.findOne({ user_id, status: "pending" });

  if (!cart) {
    return res.status(400).json({ message: "No pending cart found" });
  }

  cart.status = "closed";
  await cart.save();

  res.status(200).json({ message: "Order completed successfully", cart });
};

module.exports = {
  addToCart,
  cancelCart,
  updateCart,
  completeOrder,
  getCartItems,
};
