const mongoose = require("mongoose");

const nameSchema = new mongoose.Schema({
  first: {
    type: String,
    required: true,
    trim: true,
  },
  // middle: {
  //   type: String,
  //   trim: true,
  //   default: "",
  // },
  last: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = nameSchema;
