require("./configs/loadEnvs");
const fs = require("fs");
const path = require("path");
const { seed } = require("./initialData/initialDataService");
const cors = require("cors");
const chalk = require("chalk");

const express = require("express");
const morgan = require("morgan");
const config = require("./configs/config");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("./public"));
app.use("/uploads", express.static("uploads"));
app.use(cors());

app.use((req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    if (res.statusCode >= 400) {
      const currentDate = new Date().toISOString().split("T")[0];
      const logFilename = path.join(__dirname, "logs", `${currentDate}.log`);
      const logEntry = `Date: ${new Date().toISOString()}, Status Code: ${
        res.statusCode
      }, Error Message: ${data}\n`;

      fs.appendFile(logFilename, logEntry, (err) => {
        if (err) {
          console.error(chalk.red("Error writing to log file", err));
        }
      });
    }

    originalSend.apply(this, arguments);
  };

  next();
});

app.use("/api/users", require("./routes/users.routes"));
app.use("/api/login", require("./routes/auth.routes"));
app.use("/api/cards", require("./routes/cards.routes"));
app.use("/api/categories", require("./routes/categories.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/inventoryItem", require("./routes/inventoryItem.routes"));

app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

require("./db/dbService")
  .connect()
  .then(() => seed().catch(() => {}))
  .then(() => {
    app.listen(config.app.port, () => {
      console.log(chalk.green(`listening on port ${config.app.port}`));
    });
  });
