const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const authRoutes = require("./modules/user/routes/user.routes");
const logger = require("./utils/logger");
const Redis = require("ioredis");
const { RateLimiterRedis } = require("rate-limiter-flexible");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const app = express();
const redis = new Redis();

const radisClient = new Redis(process.env.REDIS_URL);

const rateLimiter = new RateLimiterRedis({
  storeClient: radisClient,
  keyPrefix: "middleware",
  points: 3,
  duration: 3,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  //   limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  // Redis store configuration
  store: new RedisStore({
    sendCommand: (...args) => radisClient.call(...args),
  }),
});

// apply ratelimit to our routes

app.use("/api/auth/login", limiter);

// middleware for handling json
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate Limit exceeded for IP: ${req.ip}`);
      res.status(429).json({
        success: false,
        message: "Too many requests",
      });
    });
});

app.use((req, res, next) => {
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(` Received body ${req.body} `);
  return next();
});

module.exports = { app };
