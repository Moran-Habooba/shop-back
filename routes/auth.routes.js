const router = require("express").Router();
const { User } = require("../models/users.model");
const bcrypt = require("bcrypt");
const Joi = require("joi");

router.post("/", async (req, res) => {
  const { error } = validateLogin(req.body);
  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Invalid email or password");
    return;
  }

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(401).send("Account is temporarily locked");
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 3) {
      user.lockUntil = Date.now() + 24 * 60 * 60 * 1000;
      await user.save();
      return res.status(401).send("Account is temporarily locked");
    } else {
      await user.save();
      res.status(400).send("Invalid email or password");
      return;
    }
  }

  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const token = user.generateAuthToken();
  res.json({ token });
});

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required(),
    password: Joi.string().min(6).max(1024).required(),
  }).required();

  return schema.validate(user);
}

module.exports = router;
