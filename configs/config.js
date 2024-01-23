function error(message) {
  throw new Error(message);
}

const config = {
  environment:
    process.env.ENVIRONMENT || error("ENVIRONMENT is required in env"),
  mongo: {
    uri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB_NAME,
  },
  app: {
    port: +process.env.PORT,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
};

module.exports = config;
