const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");

const {
  adjustInventoryQuantity,
  getInventoryItemByCardId,
  getInventoryItemsWithDetails,
} = require("../controllers/inventoryItem.controller");

router.get("/", authorize, getInventoryItemsWithDetails);
router.get("/:id", getInventoryItemByCardId);
router.patch("/:id/adjust-quantity", authorize, adjustInventoryQuantity);

module.exports = router;
