const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const proxy = require("express-http-proxy");
const logger = require("./utils/logger");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");

const { error } = require("winston");
const {
  IDENTITY_SERVICE_URL,
  POST_SERVICE_URL,
  MEDIA_SERVICE_URL,
  SEARCH_SERVICE_URL,
} = require("./config");
const { validateToken } = require("./middleware/auth");

const app = express();
const redisClient = new Redis(process.env.REDIS_URL);

// app.use(express.json());
app.use(helmet());
app.use(cors());

//rate limiting
const ratelimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(ratelimitOptions);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return `/api/auth${req.url.replace("/api/v1/auth", "")}`;
  },

  proxyErrorHandler: (err, res, next) => {
    logger.error("Proxy error:", err.message);
    res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  },
};

//setting up proxy for our identity service
app.use(
  "/api/v1/auth",
  proxy(IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["Content-Type"] = "application/json";
      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Identity service: ${proxyRes.statusCode}`
      );
      return proxyResData;
    },
  })
);

const postproxyOptions = {
  proxyReqPathResolver: (req) => {
    return `/api/posts${req.url.replace("/api/v1/posts", "")}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

//setting up proxy for our post service

app.use(
  "/api/v1/posts",
  validateToken,
  proxy(POST_SERVICE_URL, {
    ...postproxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      // proxyReqOpts.headers["Content-Type"] = "application/json";
      // proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
      logger.info(
        `Response received from Post service: ${proxyRes.statusCode}`
      );

      return proxyResData;
    },
  })
);

const mediaproxyOptions = {
  proxyReqPathResolver: (req) => {
    return `/api/media${req.url.replace("/api/v1/media", "")}`;
  },
  proxyErrorHandler: (err, res, next) => {
    logger.error(`Proxy error: ${err.message}`);
    res.status(500).json({
      message: `Internal server error`,
      error: err.message,
    });
  },
};

//setting up proxy for our media service
app.use(
  "/api/v1/media",
  validateToken,
  proxy(MEDIA_SERVICE_URL, {
    selfHandleResponse: false, // very important for streaming
    proxyReqPathResolver: (req) => {
      return `/api/media${req.url}`; // forward full path to match route
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user?.userId;
      if (srcReq.headers["content-type"]) {
        proxyReqOpts.headers["content-type"] = srcReq.headers["content-type"];
      }
      return proxyReqOpts;
    },
    parseReqBody : false // disables body parsing
  })
);

//setting up proxy for search service
app.use(
  "/api/v1/search",
  validateToken,
  proxy(SEARCH_SERVICE_URL, {
    selfHandleResponse: false, 
    proxyReqPathResolver: (req) => {
      return `/api/search${req.url}`; // forward full path to match route
    },
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      proxyReqOpts.headers["x-user-id"] = srcReq.user?.userId;
      if (srcReq.headers["content-type"]) {
        proxyReqOpts.headers["content-type"] = srcReq.headers["content-type"];
      }
      return proxyReqOpts;
    },
    parseReqBody : false // disables body parsing
  })
);

// app.use(
//   "/api/v1/media",
//   validateToken,
//   proxy(MEDIA_SERVICE_URL, {
//     ...mediaproxyOptions,
//     preserveReqBody: true,
//     selfHandleResponse: false, // Important for raw file stream
//     proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
//       console.log("REQ HEADERS:", srcReq.headers["content-type"]);

//       proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
//       // if (!srcReq.headers["content-type"].startsWith("multipart/form-data")) {
//       //   proxyReqOpts.headers["Content-Type"] = "application/json";
//       // }
//       return proxyReqOpts;
//     },
//     userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
//       logger.info(
//         `Response received from Post service: ${proxyRes.statusCode}`
//       );

//       return proxyResData;
//     },
//   })
// );

module.exports = app;
