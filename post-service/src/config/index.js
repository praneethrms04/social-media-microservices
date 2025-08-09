const dotenv = require("dotenv").config();

const config = {
  port: process.env.PORT || 3001,
  db_url: process.env.MONOGODB_URL,
  jwt_secret: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
};

module.exports = {
  config,
};
