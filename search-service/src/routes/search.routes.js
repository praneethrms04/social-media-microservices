const express = require("express");
const { searchPost } = require("../controllers/search.controller");
const { isAuthenticated } = require("../middleware/auth");

const searchRouter = express.Router();

searchRouter.use(isAuthenticated);
searchRouter.get("/posts", searchPost);

module.exports = searchRouter;
