const {
  InventoryItem,
  validateInventoryItem,
} = require("../models/inventory.model");
const { Card } = require("../models/cards.model");

// const getAllCardsAndQuantities = async (req, res) => {
//   try {
//     const cards = await Card.find({}); // קבלת כל הכרטיסים
//     const quantities = cards.map((card) => card.quantity); // איסוף ה-quantity של כל כרטיס
//     return quantities; // החזרת מערך של הכמויות
//   } catch (error) {
//     console.error("שגיאה בקבלת הכרטיסים והכמויות: ", error);
//     throw error;
//   }
// };

// הוספת פריט למלאי
// const addInventoryItem = async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).send("Access denied. Only admins can edit cards.");
//   }
//   const { error } = validateInventoryItem(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   let item = new InventoryItem({ ...req.body });
//   try {
//     item = await item.save();
//     res.send(item);
//   } catch (err) {
//     res.status(500).send("שגיאה בהוספת פריט למלאי: " + err.message);
//   }
// };

// עדכון פריט במלאי
// const updateInventoryItem = async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).send("Access denied. Only admins can edit cards.");
//   }
//   const { error } = validateInventoryItem(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   try {
//     const item = await InventoryItem.findByIdAndUpdate(
//       req.params.id,
//       { ...req.body },
//       { new: true }
//     );
//     if (!item) return res.status(404).send("פריט לא נמצא.");

//     res.send(item);
//   } catch (err) {
//     res.status(500).send("שגיאה בעדכון פריט מלאי: " + err.message);
//   }
// };

// מחיקת פריט מהמלאי
// const deleteInventoryItem = async (req, res) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).send("Access denied. Only admins can edit cards.");
//   }
//   try {
//     const item = await InventoryItem.findByIdAndRemove(req.params.id);
//     if (!item) return res.status(404).send("פריט לא נמצא.");

//     res.send(item);
//   } catch (err) {
//     res.status(500).send("שגיאה במחיקת פריט מהמלאי: " + err.message);
//   }
// };

// קבלת פרטי המלאי
const getInventoryItemsWithDetails = async (req, res) => {
  // if (!req.user.isAdmin) {
  //   return res
  //     .status(403)
  //     .send("Access denied. Only admins can view inventory.");
  // }

  try {
    const cards = await Card.find({}, "title category quantity");
    res.send(cards);
  } catch (err) {
    res.status(500).send("שגיאה בקבלת פרטי המלאי: " + err.message);
  }
};

const getInventoryItemByCardId = async (req, res) => {
  // if (!req.user.isAdmin) {
  //   return res.status(403).send("Access denied. Only admins can edit cards.");
  // }
  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("כרטיס לא נמצא.");
    // אם יש צורך, ניתן להשתמש במודל InventoryItem כאן לקבלת נתונים נוספים על המלאי
    res.send({ quantity: card.quantity }); // הנחה שיש שדה quantity במודל Card
  } catch (err) {
    res.status(500).send("שגיאה בקבלת כמות המלאי: " + err.message);
  }
};

const adjustInventoryQuantity = async (req, res) => {
  // if (!req.user.isAdmin) {
  //   return res.status(403).send("הגישה נדחתה. רק מנהלים יכולים לעדכן כרטיסים.");
  // }
  const { adjustment } = req.body;

  try {
    const card = await Card.findById(req.params.id);
    if (!card) return res.status(404).send("כרטיס לא נמצא.");

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
  //   deleteInventoryItem,
  //   updateInventoryItem,
  //   addInventoryItem,
  //   getAllCardsAndQuantities,
};
