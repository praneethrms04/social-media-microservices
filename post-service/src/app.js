const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const Redis = require("ioredis");
const logger = require("./utils/logger");
const postRouter = require("./routes/post.routes");
const { config } = require("./config");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const redisClient = new Redis(config.REDIS_URL);

app.use(express.json());
app.use(helmet());
app.use(cors());

//routes -> pass redisclient to routes
app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRouter
);

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(` Received body ${req.body} `);
  return next();
});

app.use(errorHandler);
//unhandled promise rejection

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});

module.exports = { app };
