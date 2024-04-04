const { users, cards, categoriesData } = require("./initialData.json");
const { User } = require("../models/users.model");
const { Card } = require("../models/cards.model");
const { Category } = require("../models/category.model");

const _ = require("lodash");
const chalk = require("chalk");
const bcrypt = require("bcrypt");

if (require.main === module) {
  require("../configs/loadEnvs");

  require("../db/dbService")
    .connect()
    .then(() => seed());
}

async function seed() {
  const existingUsersCount = await User.countDocuments();
  const existingCardsCount = await Card.countDocuments();

  if (existingUsersCount > 0 || existingCardsCount > 0) {
    console.log(chalk.magenta("The users and cards already exist"));
    return;
  }

  const createdUsers = await generateUsers();

  const firstBusinessUser = createdUsers.find((user) => user.isBusiness);

  if (firstBusinessUser) {
    await generateCards(firstBusinessUser._id);
    await generateCategories(categoriesData);
  }

  console.log(chalk.yellow("seeded"));
}

async function generateUsers() {
  const Ps = [];
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    user.password = hashedPassword;
    const newUser = await new User(user).save();
    Ps.push(newUser);
  }

  return await Promise.all(Ps);
}
async function generateCards(user_id) {
  const Ps = [];
  for (const card of cards) {
    const newCard = await new Card(card).save();
    newCard.user_id = user_id;
    Ps.push(newCard);
  }

  return await Promise.all(Ps);
}
async function generateCategories(categoriesData) {
  const Ps = [];
  for (const categoryData of categoriesData) {
    const existingCategory = await Category.findOne({
      name: categoryData.name,
    });
    if (!existingCategory) {
      const newCategory = new Category(categoryData);
      await newCategory.save();
      Ps.push(newCategory);
    } else {
      console.log(`Category ${categoryData.name} already exists`);
    }
  }

  return await Promise.all(Ps);
}

module.exports = { seed };
