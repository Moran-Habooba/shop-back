const { mongo } = require("../configs/config");
const mongoose = require("mongoose");
const chalk = require("chalk");

async function connect() {
  const uri = `${mongo.uri}${mongo.uri.at(-1) === "/" ? "" : "/"}${
    mongo.dbName
  }`;

  console.log(chalk.blue(`connecting to db: ${uri}`));

  return mongoose
    .connect(uri)
    .then(() => console.log(chalk.green("connected to db")))
    .catch((err) =>
      console.log(chalk.red("could not connect to db", err.message))
    );
}

module.exports = { connect };
