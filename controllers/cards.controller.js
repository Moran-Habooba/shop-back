const { Card, validateCard } = require("../models/cards.model");
const { generateRandomBizNumber } = require("../utils/generateRandomBizNumber");
const mongoose = require("mongoose");

// async function addCard(req, res) {
//   const { error } = validateCard(req.body);
//   if (error) return res.status(400).send(error.details[0].message);
//   try {
//     const randomBizNumber = generateRandomBizNumber();
//     const userId = req.user._id;
//     let card = new Card({
//       ...req.body,
//       bizNumber: randomBizNumber,
//       user_id: userId,
//     });
//     card.user_id = userId;
//     card = await card.save();
//     res.send(card);
//   } catch (err) {
//     res.status(500).send("Error: " + err.message);
//   }
// }
async function addCard(req, res) {
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied. Only admins can create cards.");
  }
  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const randomBizNumber = generateRandomBizNumber();
    const userId = req.user._id;
    const categoryName = req.body.category;
    let card = new Card({
      ...req.body,
      bizNumber: randomBizNumber,
      user_id: userId,
      category: categoryName,
    });
    card.user_id = userId;
    card = await card.save();
    res.send(card);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}

async function getAllCards(req, res) {
  try {
    const cards = await Card.find();
    res.send(cards);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
async function getCardById(req, res) {
  try {
    const cardId = req.params.id;
    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send("Card not found");
    }

    res.send(card);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).send("Invalid ID format");
    }
    res.status(500).send("Error: " + err.message);
  }
}
async function deleteCard(req, res) {
  try {
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send("Card not found");
    }

    const isUserAdmin = req.user.isAdmin;
    const isCreator = card.user_id.toString() === req.user._id;

    if (!isUserAdmin && !isCreator) {
      return res
        .status(403)
        .send(
          "Access denied. Only the admin or the creator can delete this card."
        );
    }

    await Card.findByIdAndDelete(cardId);

    res.send("Card deleted successfully");
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}
const getMyCards = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).send("User is not authorized or not found.");
    }
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user ID format.");
    }
    const cards = await Card.find({ user_id: userId });
    if (!cards.length) {
      return res.status(404).send("No cards found for this user.");
    }
    res.send(cards);
  } catch (error) {
    console.error(chalk.red("Error fetching cards:", error));
    res.status(500).send("Error fetching cards: " + error.message);
  }
};

async function likeCard(req, res) {
  try {
    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send("Card not found");
    }

    const userId = req.user._id;

    const userIndex = card.likes.indexOf(userId);
    if (userIndex === -1) {
      card.likes.push(userId);
      await card.save();
      return res.send("Card liked successfully");
    } else {
      card.likes.splice(userIndex, 1);
      await card.save();
      return res.send("Card unliked successfully");
    }
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
}

const editCardById = async (req, res) => {
  try {
    const userId = req.user._id;
    const cardId = req.params.id;

    const card = await Card.findOne({ _id: cardId, user_id: userId });
    if (!card) {
      return res
        .status(403)
        .send(
          "You do not have permission to edit this card.Only the user who created the card can edit it"
        );
    }

    const updatedCard = await Card.findByIdAndUpdate(cardId, req.body, {
      new: true,
    });

    res.send(updatedCard);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
};

async function editBizNumberByAdmin(req, res) {
  try {
    const cardId = req.params.id;
    const newBizNumber = req.body.bizNumber.toString();

    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only admins can perform this action.");
    }
    if (newBizNumber.length !== 7) {
      return res.status(400).send("The business number must be 7 digits.");
    }
    const existingCard = await Card.findOne({ bizNumber: newBizNumber });
    if (existingCard) {
      return res.status(400).send("The business number is already taken.");
    }

    const updatedCard = await Card.findByIdAndUpdate(
      cardId,
      { bizNumber: newBizNumber },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(404).send("Card not found.");
    }

    res.send(updatedCard);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
}
async function getCardByBizNumber(req, res) {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only administrators can perform this action.");
    }

    const cardId = req.params.id;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).send("Card with the given ID was not found.");
    }
    res.send(card);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
}

module.exports = {
  addCard,
  getAllCards,
  getCardById,
  deleteCard,
  getMyCards,
  likeCard,
  editCardById,
  editBizNumberByAdmin,
  getCardByBizNumber,
};
