const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const mediaRouter = require("./routes/media.routes");
const { isAuthenticated } = require("../../post-service/src/middleware/auth");

const bodyParser = require("body-parser");


const app = express();
const fileUpload = require("express-fileupload");
const logger = require("./utils/logger");

app.use(helmet());
app.use(cors());
// Set limit to 50MB or more as needed
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(fileUpload());

//routes -> pass redisclient to routes
app.use("/api/media", mediaRouter);
// app.use(express.json());

app.use((req, res, next) => {
  console.log("Media service received request:", req.method, req.originalUrl);
  logger.info(`Recieved ${req.method} request to ${req.url}`);
  logger.info(` Received body ${req.body} `);
  return next();
});

app.use(errorHandler);

module.exports = { app };
