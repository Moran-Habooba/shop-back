const jwt = require("jsonwebtoken");
const chalk = require("chalk");
const { User, canMakeRequests } = require("../models/users.model");

async function authorize(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send("Access denied. No token provided.");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log(chalk.blue("JWT payload:", JSON.stringify(payload, null, 2)));

    req.user = payload;

    // const user = await User.findById(req.user._id);
    // const canMakeRequest = await canMakeRequests(user);
    // if (!canMakeRequest) {
    //   throw new Error("Too many requests.. please try again tomorrow");
    // }

    if (payload.role) {
      if (payload.role === "admin") {
        req.isAdmin = true;
      }

      if (payload.role === "business") {
        req.isBusiness = true;
      }
    }

    next();
  } catch (err) {
    console.error(chalk.red("Token verification error:", err));
    res.status(400).send("Invalid token.");
  }
}

module.exports = {
  authorize,
};
