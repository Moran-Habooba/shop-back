const mongoose = require("mongoose");
const { User, validateUser } = require("../models/users.model");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, image_file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, image_file, cb) {
    cb(null, Date.now() + "-" + image_file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// async function addUser(req, res) {
//   const { error } = validateUser(req.body);
//   if (error) {
//     return res.status(400).send(error.details[0].message);
//   }

//   try {
//     const user = await User.findOne({ email: req.body.email });
//     if (user) {
//       return res.status(400).send("User already registered");
//     }

//     const newUser = new User({
//       ...req.body,
//       password: await bcrypt.hash(req.body.password, 12),
//     });

//     await newUser.save();

//     res.json(_.pick(newUser, ["_id", "name", "email"]));
//   } catch (err) {
//     res.status(500).send("Error: " + err.message);
//   }
// }

async function addUser(req, res) {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send("User already registered");
    }

    const imagePath = req.file ? req.file.path : null;

    console.log("req.image_file:", req.image_file);

    const newUser = new User({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 12),
      image_file: {
        path: imagePath,
      },
    });

    await newUser.save();

    res.json(_.pick(newUser, ["_id", "name", "email", "imagePath"]));
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}

async function getAllUsers(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only admin users can access this data.");
    }

    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    return res.status(500).send("An error occurred.");
  }
}

async function getUserById(req, res) {
  try {
    const requestedUserId = req.params.id;
    const requestingUser = req.user;

    if (!mongoose.Types.ObjectId.isValid(requestedUserId)) {
      return res.status(400).send("Invalid user ID.");
    }

    if (!requestingUser.isAdmin && requestingUser._id !== requestedUserId) {
      return res
        .status(403)
        .send("Access denied. You can only access your own data.");
    }

    const user = await User.findById(requestedUserId).select("-password");

    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.json(user);
  } catch (error) {
    return res.status(500).send("An error occurred.");
  }
}

async function editUser(req, res) {
  try {
    const userId = req.params.id;
    const requestingUser = req.user;

    if (!requestingUser || requestingUser._id !== userId) {
      return res
        .status(403)
        .send("Access denied. You can only edit your own profile.");
    }

    const userToUpdate = await User.findById(userId);

    if (!userToUpdate) {
      return res.status(404).send("User not found.");
    }

    const updateData = { ...req.body };
    delete updateData.isAdmin;
    delete updateData.email;
    delete updateData.password;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    return res.status(500).send("An error occurred: " + error.message);
  }
}

// async function changeStatus(req, res) {
//   try {
//     const userId = req.params.id;
//     const requestingUser = req.user;
//     const { isBusiness } = req.body;

//     if (!requestingUser || requestingUser._id !== userId) {
//       return res
//         .status(403)
//         .send(
//           "Access denied. You can only change the status of your own account."
//         );
//     }

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { isBusiness },
//       { new: true }
//     ).select("-password");

//     if (!updatedUser) {
//       return res.status(404).send("User not found.");
//     }

//     res.json({ isBusiness: updatedUser.isBusiness });
//   } catch (error) {
//     return res.status(500).send("An error occurred: " + error.message);
//   }
// }

async function deleteUserById(req, res) {
  try {
    const userId = req.params.id;
    const user = req.user;

    if (!user.isAdmin && userId !== user._id) {
      return res.status(403).send("Access denied.");
    }

    const deletedUser = await User.findOneAndDelete({ _id: userId });

    if (!deletedUser) {
      return res.status(404).send("User not found.");
    }

    res.json("User deleted successfully.");
  } catch (error) {
    return res.status(500).send("An error occurred: " + error.message);
  }
}

// async function promoteUserToAdmin(req, res) {
//   try {
//     const userId = req.params.id;
//     const { isAdmin } = req.body;

//     const connectedUser = await User.findById(req.user._id);

//     if (connectedUser.isAdmin) {
//       const updatedUser = await User.findByIdAndUpdate(
//         userId,
//         { isAdmin },
//         { new: true }
//       ).select("-password");

//       if (!updatedUser) {
//         return res.status(404).send("User not found.");
//       }

//       res.json({ isAdmin: updatedUser.isAdmin });
//     } else {
//       return res
//         .status(403)
//         .send("Access denied. Only admin users can change user status.");
//     }
//   } catch (error) {
//     return res.status(500).send("An error occurred: " + error.message);
//   }
// }
async function changeUserStatus(req, res) {
  try {
    const userId = req.params.id;
    const { isBusiness, isAdmin } = req.body;
    const requestingUser = req.user;

    // בדיקה אם המשתמש המחובר הוא אדמין
    if (!requestingUser.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only admin users can change user status.");
    }

    // עדכון המשתמש בהתאם לפרמטרים הנתונים
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isBusiness, isAdmin },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).send("User not found.");
    }

    res.json({
      isBusiness: updatedUser.isBusiness,
      isAdmin: updatedUser.isAdmin,
    });
  } catch (error) {
    return res.status(500).send("An error occurred: " + error.message);
  }
}

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  editUser,
  // changeStatus,
  deleteUserById,
  // promoteUserToAdmin,
  changeUserStatus,
  upload,
};
