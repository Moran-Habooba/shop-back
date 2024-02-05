const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");

const {
  adjustInventoryQuantity,
  getInventoryItemByCardId,
  getInventoryItemsWithDetails,
  // addInventoryItem,
  // deleteInventoryItem,
  //   updateInventoryItem,
  //   getAllCardsAndQuantities,
} = require("../controllers/inventoryItem.controller");

router.get("/", authorize, getInventoryItemsWithDetails);
// router.get("/getAllCardsAndQuantities", authorize, getAllCardsAndQuantities);
router.get("/:id", authorize, getInventoryItemByCardId);
// router.post("/", authorize, addInventoryItem);
// router.put("/:id", authorize, updateInventoryItem);
router.patch("/:id/adjust-quantity", authorize, adjustInventoryQuantity);
// router.delete("/:id", authorize, deleteInventoryItem);

module.exports = router;
