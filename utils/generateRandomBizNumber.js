const _ = require("lodash");
const Card = require("../models/cards.model");

function generateRandomBizNumber() {
  return _.random(1000000, 9999999);
}

module.exports = { generateRandomBizNumber };
