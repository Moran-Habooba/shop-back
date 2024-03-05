const { Card, validateCard } = require("../models/cards.model");
const { generateRandomBizNumber } = require("../utils/generateRandomBizNumber");
const mongoose = require("mongoose");
const multer = require("multer");

function sanitizeFileName(filename) {
  return filename.replace(/[^\w\d. -]/g, "_");
}

const storage = multer.diskStorage({
  destination: function (req, image_file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, image_file, cb) {
    console.log("Original filename:", image_file.originalname);

    const cleanFileName = sanitizeFileName(image_file.originalname);
    console.log("Original filename:", image_file.originalname);

    cb(null, Date.now() + "-" + cleanFileName);
  },
});

async function addCard(req, res) {
  if (!req.user.isAdmin) {
    return res.status(403).send("Access denied. Only admins can create cards.");
  }

  const { error } = validateCard(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const randomBizNumber = generateRandomBizNumber();
    let card = new Card({
      ...req.body,
      bizNumber: randomBizNumber,
      user_id: req.user._id,
      category: req.body.category.toLowerCase().trim(),
    });

    if (req.file) {
      card.image_file = {
        path: req.file.path,
        originalname: req.file.originalname,
      };
    }

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
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .send("Access denied. Only admins can create cards.");
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
    const cardId = req.params.id;

    console.log("Updating card with ID:", cardId);
    console.log("Data received for update:", req.body);

    if (!req.user.isAdmin) {
      return res.status(403).send("Access denied. Only admins can edit cards.");
    }

    const updates = { ...req.body };

    if (req.file) {
      updates.image_file = {
        path: req.file.path.replace(/\\/g, "/"),
        originalname: req.file.originalname,
      };
    }

    const updatedCard = await Card.findByIdAndUpdate(cardId, updates, {
      new: true,
    });

    console.log("Updated card:", updatedCard);

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
