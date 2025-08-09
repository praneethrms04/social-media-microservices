const dotenv = require("dotenv").config();

const config = {
  PORT: process.env.PORT || 3000,
  MONOGODB_URL: process.env.MONOGODB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  IDENTITY_SERVICE_URL: process.env.IDENTITY_SERVICE_URL,
  POST_SERVICE_URL: process.env.POST_SERVICE_URL,
  MEDIA_SERVICE_URL: process.env.MEDIA_SERVICE_URL,
  SEARCH_SERVICE_URL : process.env.SEARCH_SERVICE_URL

};

module.exports = config;
