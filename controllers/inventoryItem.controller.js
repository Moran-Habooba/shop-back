const { Card } = require("../models/cards.model");

const getInventoryItemsWithDetails = async (req, res) => {
  try {
    const cards = await Card.find({}, "title category quantity");
    res.send(cards);
  } catch (err) {
    res.status(500).send("שגיאה בקבלת פרטי המלאי: " + err.message);
  }
};

const getInventoryItemByCardId = async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("כרטיס לא נמצא.");
    res.send({ quantity: card.quantity });
  } catch (err) {
    res.status(500).send("שגיאה בקבלת כמות המלאי: " + err.message);
  }
};

const adjustInventoryQuantity = async (req, res) => {
  const { adjustment } = req.body;

  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("כרטיס לא נמצא.");
    console.log("Sending inventory quantity:", card.quantity);

    card.quantity += adjustment;
    await card.save();
    res.send(card);
  } catch (err) {
    res.status(500).send("שגיאה בעדכון כמות המלאי: " + err.message);
  }
};

module.exports = {
  adjustInventoryQuantity,
  getInventoryItemByCardId,
  getInventoryItemsWithDetails,
};
