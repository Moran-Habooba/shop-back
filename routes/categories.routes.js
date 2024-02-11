const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");
const checkAdminPermission = require("../middleware/checkAdminPermission");

const {
  addCategory,
  removeCategory,
  getAllCategories,
  getProductsCountInCategory,
  getProductsByCategory,
} = require("../controllers/categories.controller");

router.post("/", authorize, checkAdminPermission, addCategory);
router.get("/", getAllCategories);
router.get(
  "/:categoryName/productsCount",
  authorize,
  checkAdminPermission,
  getProductsCountInCategory
);
router.get("/:categoryName/products", getProductsByCategory);
router.delete("/:id", authorize, checkAdminPermission, removeCategory);

module.exports = router;
