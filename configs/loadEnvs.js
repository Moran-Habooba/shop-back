const path = require("node:path");
const chalk = require("chalk");

const envPath = path.resolve(__dirname, `../${`.env.${process.env.NODE_ENV}`}`);

console.log(chalk.blue("loading environment variables from: ", envPath));

require("dotenv").config({
  path: envPath,
});
