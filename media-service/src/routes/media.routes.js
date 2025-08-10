const express = require("express");

const {
  uploadMedia,
  getMediaUrls,
} = require("../controllers/media.controller");

const { isAuthenticated } = require("../middleware/auth");

const mediaRouter = express.Router();

mediaRouter.post("/upload", isAuthenticated, uploadMedia);
mediaRouter.get("/get", isAuthenticated, getMediaUrls);

module.exports = mediaRouter;
