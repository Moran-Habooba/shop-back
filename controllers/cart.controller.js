const { Cart } = require("../models/cart.model");
const Card = require("../models/cards.model");
const { Order } = require("../models/order.model");
const { generateRandomBizNumber } = require("../utils/generateRandomBizNumber");

const addToCart = async (req, res) => {
  try {
    console.log("Request to add to cart:", req.body);

    const { card_id, quantity } = req.body;
    if (!card_id) {
      return res.status(400).json({ message: "Invalid card_id" });
    }
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
        status: "pending",
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
    const user_id = req.user._id;

    const cart = await Cart.findOne({ user_id }).populate({
      path: "items.card_id",
      model: "Card",
    });

    if (!cart) {
      return res.status(200).json({ cart: null });
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
      (item) => item.card_id.toString() === itemUpdate.id
    );

    if (itemIndex > -1) {
      const updatedQuantity = parseInt(itemUpdate.quantity);
      if (updatedQuantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = updatedQuantity;
      }
    } else {
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
  console.log("Receiving order details:", req.body);
  const { city, street, houseNumber } = req.body;
  console.log(
    `Order Details - City: ${city}, Street: ${street}, HouseNumber: ${houseNumber}, 
    )}`
  );

  try {
    const newOrder = new Order({
      user_id: user_id,
      orderNumber: generateRandomBizNumber(),
      status: "pending",
      city,
      street,
      houseNumber,
    });

    await newOrder.save();

    const cart = await Cart.findOneAndUpdate(
      { user_id, status: "pending" },
      { status: "pending" },
      { new: true }
    );

    newOrder.status = "close";
    await newOrder.save();

    cart.items = [];
    await cart.save();
    res.status(200).json({
      message: "Order created and closed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error occurred while creating the order" });
  }
};

const removeFromCart = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const user_id = req.user._id;
  const card_id = req.params.card_id;

  let cart = await Cart.findOne({ user_id, status: "pending" });

  if (!cart) {
    return res.status(400).json({ message: "No pending cart found" });
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.card_id.toString() === card_id
  );

  if (itemIndex > -1) {
    cart.items.splice(itemIndex, 1);
  } else {
    return res.status(404).json({ message: "Item not found in the cart" });
  }

  await cart.save();

  cart = await Cart.findOne({ user_id }).populate({
    path: "items.card_id",
    model: "Card",
  });

  res
    .status(200)
    .json({ message: "Item removed from the cart successfully", cart });
};

const createOrderFromCart = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const user_id = req.user._id;
  const cart = await Cart.findOne({ user_id, status: "pending" });

  if (!cart || cart.items.length === 0) {
    return res
      .status(400)
      .json({ message: "No items in the cart to create an order" });
  }

  const newOrder = new Order({
    user_id: user_id,
    orderNumber: generateRandomBizNumber(),
    status: "pending",

    items: [
      {
        card_id: card_id,
        quantity: quantity,
      },
    ],
  });

  try {
    await newOrder.save();
    cart.status = "completed";
    await cart.save();

    res
      .status(200)
      .json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error occurred while creating the order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user_id = req.user._id;
    const orders = await Order.find({ user_id }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving orders", error });
  }
};
const getAllClosedOrders = async (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied. Only admins can create cards.");
  }
  try {
    const closedOrders = await Order.find({ status: "close" }).sort({
      createdAt: -1,
    });

    if (!closedOrders.length) {
      return res.status(404).json({ message: "No closed orders found" });
    }

    res.json({ closedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving closed orders", error });
  }
};

module.exports = {
  addToCart,
  cancelCart,
  updateCart,
  completeOrder,
  getCartItems,
  removeFromCart,
  createOrderFromCart,
  getMyOrders,
  getAllClosedOrders,
};
