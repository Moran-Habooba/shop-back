const mongoose = require("mongoose");
const { User, validateUser } = require("../models/users.model");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const dotenv = require("dotenv");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
dotenv.config();
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
      isBusiness: true,
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
    const imagePath = req.file ? req.file.path : null;

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
    delete updateData.isBusiness;

    if (imagePath !== null) {
      updateData.image_file = { path: imagePath };
    } else {
      updateData.image_file = userToUpdate.image_file;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    return res.status(500).send("An error occurred: " + error.message);
  }
}

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

async function changeUserStatus(req, res) {
  try {
    const userId = req.params.id;
    const { isBusiness, isAdmin } = req.body;
    const requestingUser = req.user;

    if (!requestingUser.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only admin users can change user status.");
    }

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

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  console.log("Email:", email, "New Password:", newPassword);
  if (!email || typeof email !== "string") {
    return res.status(400).send("Invalid email address.");
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }
    const resetToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:3001/resetPassword?token=${resetToken}`;
    const subject = "איפוס סיסמא לאתר תורתך שעשועי";
    const text = `לחץ כאן לאיפוס הסיסמא שלך: ${resetLink}`;
    await sendEmail(email, subject, text);

    return res.status(200).send("מייל עם קישור לאיפוס סיסמא נשלח בהצלחה");
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  service: "gmail",
  auth: {
    user: process.env.USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

async function sendEmail(email, subject, text) {
  try {
    const mailOptions = {
      from: process.env.FROM,
      to: email,
      subject: subject,
      text: text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function resetUserPassword(req, res) {
  const { token, newPassword, email } = req.body;

  if (!token || !newPassword || !email) {
    return res.status(400).send("נתונים חסרים");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({ _id: decoded._id, email: email });
    if (!user) {
      return res.status(404).send("המשתמש אינו תואם למייל או לא נמצא");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    console.log(`User ${user.email} password was successfully reset.`);
    res.send("הסיסמה שונתה בהצלחה.");
  } catch (error) {
    console.error("Error resetting password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).send("פג תוקף הטוקן");
    }
    res.status(500).send("שגיאת שרת פנימית");
  }
}

module.exports = {
  addUser,
  getAllUsers,
  getUserById,
  editUser,
  deleteUserById,
  resetUserPassword,
  changeUserStatus,
  upload,
  resetPassword,
};
