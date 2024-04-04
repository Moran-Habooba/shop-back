const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1000,
    },

    last_name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 1000,
    },

    country: {
      type: String,
      minLength: 2,
      maxLength: 256,
      trim: true,
      lowercase: true,
      default: "",
      required: true,
    },
    city: {
      type: String,
      minLength: 2,
      maxLength: 256,
      trim: true,
      lowercase: true,
      default: "",
      required: true,
    },
    street: {
      type: String,
      minLength: 2,
      maxLength: 256,
      trim: true,
      lowercase: true,
      default: "",
      required: true,
    },
    houseNumber: {
      type: Number,
      required: true,
      trim: true,
      minLength: 1,
    },
    zip: {
      type: Number,
      trim: true,
      minLength: 5,
      default: 0,
    },

    image_file: {
      path: String,
      originalname: String,
    },

    email: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 255,
      unique: true,
      lowercase: true,
      match: RegExp(
        /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
      ),
    },
    password: {
      type: String,
      required: true,
      minlength: 9,
      maxlength: 1024,
      trim: true,
    },

    isBusiness: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: true,
      match: RegExp(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/),
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    requestCount: {
      type: Number,
      default: 0,
    },
    requestResetTime: {
      type: Date,
      default: Date.now,
    },
  },
  {
    methods: {
      generateAuthToken() {
        return jwt.sign(
          { _id: this._id, isBusiness: this.isBusiness, isAdmin: this.isAdmin },
          process.env.JWT_SECRET,
          { expiresIn: "4h" }
        );
      },
    },
  }
);

const User = mongoose.model("User", userSchema, "users");

// Locking a user for 24 hours after entering an incorrect password 3 times in a row
userSchema.methods.incrementLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil > Date.now()) {
    return;
  }
  this.loginAttempts += 1;
  if (this.loginAttempts >= 3) {
    this.lockUntil = Date.now() + 24 * 60 * 60 * 1000;
  }
  return this.save();
};
userSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

async function canMakeRequests(u) {
  const now = new Date();
  console.log(
    `Current Time: ${now}, Reset Time: ${u.requestResetTime}, Request Count: ${u.requestCount}`
  );

  if (u.requestResetTime < now) {
    console.log("Resetting request count and time.");

    u.requestCount = 0;
    u.requestResetTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await u.save();
    return true;
    // Change here to 100 requests
  } else if (u.requestCount < 100) {
    u.requestCount += 1;
    await u.save();
    return true;
  } else {
    return false;
  }
}

userSchema.methods.resetRequestCount = function () {
  this.requestCount = 0;
  this.requestResetTime = Date.now();
  return this.save();
};

function validateUser(user) {
  const schema = Joi.object({
    first_name: Joi.string().min(2).max(1000).required(),
    last_name: Joi.string().min(2).max(1000).required(),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    street: Joi.string().min(2).max(256).required(),
    // houseNumber: Joi.number().min(1).max(250).required(),
    houseNumber: Joi.number().min(1).max(99999999).required(),
    zip: Joi.number().min(1).max(99999999).integer().required(),
    image_file: Joi.any().optional(),
    email: Joi.string()
      .pattern(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/)
      .message("user mail mast be a valid mail")
      .required(),
    password: Joi.string()
      .min(9)
      .max(1024)
      .required()
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*'-]).+$/)
      .message(
        "password must be at least 9 characters long and contain an uppercase letter, a lowercase letter, a number and one of the following characters !@#$%^&*-'"
      ),
    isBusiness: Joi.boolean().required(),
    isAdmin: Joi.boolean().allow(""),
    phone: Joi.string()
      .pattern(/0[0-9]{1,2}\-?\s?[0-9]{3}\s?[0-9]{4}/)
      .message("user phone mast be a valid phone number")
      .required(),
  }).required();

  return schema.validate(user);
}

module.exports = {
  User,
  validateUser,
  canMakeRequests,
};
