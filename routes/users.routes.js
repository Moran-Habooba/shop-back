const router = require("express").Router();
const { User } = require("../models/users.model");
const upload = require("../controllers/users.controller").upload;

const _ = require("lodash");
const { authorize } = require("../middleware/auth.mw");
const {
  addUser,
  getAllUsers,
  getUserById,
  editUser,
  deleteUserById,
  changeUserStatus,
  resetPassword,
  resetUserPassword,
} = require("../controllers/users.controller");

router.get("/me", authorize, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

router.post("/", upload.single("image_file"), addUser);
router.post("/emailVerification", resetPassword);
router.post("/resetPassword", resetUserPassword);
router.get("/", authorize, getAllUsers);

router.get("/:id", authorize, getUserById);
router.put("/edit/:id", authorize, upload.single("image_file"), editUser);
router.patch("/:id", authorize, changeUserStatus);
router.delete("/:id", authorize, deleteUserById);

module.exports = router;
