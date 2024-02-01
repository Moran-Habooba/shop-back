const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");
const {
  addToCart,
  cancelCart,
  updateCart,
  completeOrder,
  getCartItems,
  removeFromCart,
  createOrderFromCart,
  getMyOrders,
} = require("../controllers/cart.controller");

router.post("/", authorize, addToCart);
router.get("/", authorize, getCartItems);
router.post("/create", authorize, createOrderFromCart);
router.get("/my-orders", authorize, getMyOrders);
router.post("/cancel", authorize, cancelCart);
router.put("/update", authorize, updateCart);
router.post("/complete", authorize, completeOrder);
router.delete("/remove/:card_id", authorize, removeFromCart);

module.exports = router;
