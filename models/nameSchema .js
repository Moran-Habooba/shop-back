const mongoose = require("mongoose");

const nameSchema = new mongoose.Schema({
  first: {
    type: String,
    required: true,
    trim: true,
  },

  last: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports = nameSchema;
