const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const searchRouter = require("./routes/search.routes");
const errorHandler = require("./middleware/errorHandler");
const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors());

app.use("/api/search", searchRouter);
app.use(errorHandler);

module.exports = { app };
