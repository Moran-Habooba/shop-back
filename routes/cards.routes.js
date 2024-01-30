const router = require("express").Router();
const { authorize } = require("../middleware/auth.mw");
const upload = require("../controllers/users.controller").upload;

const {
  addCard,
  getAllCards,
  getCardById,
  deleteCard,
  getMyCards,
  likeCard,
  editCardById,
  editBizNumberByAdmin,
  getCardByBizNumber,
} = require("../controllers/cards.controller");

function businessOnly(req, res, next) {
  if (!req.user.isBusiness) {
    return res.status(403).send("Access denied. Business users only.");
  }
  next();
}
router.post("/", authorize, upload.single("image_file"), addCard);
router.get("/", getAllCards);
router.get("/my-cards", authorize, getMyCards);
router.get("/:id", getCardById);
router.delete("/:id", authorize, deleteCard);
router.patch("/:id", authorize, likeCard);
// router.put("/edit/:id", authorize, editCardById);
router.put("/edit/:id", authorize, upload.single("image_file"), editCardById);

router.patch("/editBiz/:id", authorize, editBizNumberByAdmin);
router.get("/biz-number/:id", authorize, getCardByBizNumber);

module.exports = router;
