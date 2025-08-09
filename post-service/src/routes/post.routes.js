const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post.controller");
const { isAuthenticated } = require("../middleware/auth");

const postRouter = express.Router();

postRouter.use(isAuthenticated);

postRouter.post("/create-post", createPost);
postRouter.get("/all-posts", getAllPosts);
postRouter.get("/:id", getPost);
postRouter.delete("/:id", deletePost);

module.exports = postRouter;
