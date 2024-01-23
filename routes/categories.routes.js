const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");
const checkAdminPermission = require("../middleware/checkAdminPermission");

const {
  addCategory,
  removeCategory,
  getAllCategories,
  getProductsCountInCategory,
} = require("../controllers/categories.controller");

router.post("/", authorize, checkAdminPermission, addCategory);
router.get("/", authorize, checkAdminPermission, getAllCategories);
router.get(
  "/:categoryName/productsCount",
  authorize,
  checkAdminPermission,
  getProductsCountInCategory
);
router.delete("/:id", authorize, checkAdminPermission, removeCategory);

module.exports = router;
