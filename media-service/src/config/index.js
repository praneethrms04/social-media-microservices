const dotenv = require("dotenv").config();

const config = {
  port: process.env.PORT || 3004,
  db_url: process.env.MONOGODB_URL,
  jwt_secret: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  AWS_REGION: process.env.AWS_REGION,
  AWS_ACCESS_KEY : process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY : process.env.AWS_SECRET_KEY,
  AWS_S3_BUCKET : process.env.AWS_S3_BUCKET,
  RABBITMQ_URL : process.env.RABBITMQ_URL
};

module.exports = config;
