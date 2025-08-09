const { default: mongoose } = require("mongoose");
const Post = require("../models/Post");
const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const validateCache = require("../utils/validateCache");
const { publishEvent } = require("../utils/rabbitmq");

/**
 * @desc Create Post
 * @route POST
 * @access private
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const createPost = async (req, res, next) => {
  logger.info("Create post endpoint hit ....");
  try {
    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn("Validation error", error.details[0].message);
      res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { content, mediaIds } = req.body;
    const createNewPost = new Post({
      user: req.user.userId,
      content,
      mediaIds: mediaIds || [],
    });

    await createNewPost.save();

    await publishEvent("social.post.created", {
      postId: createNewPost._id.toString(),
      userId: createNewPost.user.toString(),
      content: createNewPost.content,
      createdAt: createNewPost.createdAt,
    });
    
    await validateCache(req, createNewPost._id.toString());

    logger.info("created post successfully", createNewPost);
    res.status(201).json({
      success: true,
      message: "created post successfully ",
      data: createNewPost,
    });
  } catch (error) {
    logger.error("create post ", error);
    console.log("error");
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc Get all Post
 * @route GET
 * @access private
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const getAllPosts = async (req, res, next) => {
  logger.info("Get all posts endpoint hit...");
  try {
    const { pageSize = 10, pageIndex = 1 } = req.query;

    const page = parseInt(pageIndex);
    const limit = parseInt(pageSize);
    const skip = (page - 1) * limit;

    const cacheKey = `posts:${page}:${limit}`;

    const cachedPosts = await req.redisClient.get(cacheKey);

    if (cachedPosts) {
      return res.json(JSON.parse(cachedPosts));
    }

    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    // save posts on redis cache
    await req.redisClient.setex(cacheKey, 300, JSON.stringify(result));
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("get all posts", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc Get SinglePost
 * @route GET
 * @access private
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const getPost = async (req, res) => {
  const postId = req.params.id;
  console.log(postId);
  const cacheId = `post:${postId}`;
  logger.info("Get Post endpoint hit...", { postId });

  try {
    // check for valid MongoDB objectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      logger.warn("Invalid post ID format", { postId });
      res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    // Check redis Cache
    const redisPostData = await req.redisClient.get(cacheId);
    if (redisPostData) {
      logger.info("Post retrieved from cache", { postId });
      return res.status(200).json({
        success: true,
        data: JSON.parse(redisPostData),
      });
    }

    // fetch from ID
    const result = await Post.findById(postId);
    if (!result) {
      logger.warn("Post not found ", { postId });
      res.status(404).json({
        success: false,
        message: "Post Id not found",
      });
    }

    //5mins cache delete
    await req.redisClient.setex(cacheId, 300, JSON.stringify(result));

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    logger.error("get post error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * @desc Delete Post
 * @route DEKETE
 * @access private
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const deletePost = async (req, res, next) => {
  const postId = req.params.id;
  logger.info("Delete Post endpoint hit...", { postId });
  try {
    // check for valid MongoDB objectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      logger.warn("Invalid post ID format", { postId });
      return res.status(400).json({
        success: false,
        message: "Invalid post ID format",
      });
    }

    const post = await Post.findByIdAndDelete({
      _id: postId,
      user: req.user.userId,
    });

    if (!post) {
      logger.warn("Post not found ", { postId });
      return res.status(404).json({
        success: false,
        message: "Post Id not found",
      });
    }

    // publish post delete method => RabbitMQ

    await publishEvent("social.post.deleted", {
      postId: post._id.toString(),
      userId: req.user.userId,
      mediaIds: post.mediaIds,
    });

    // delete cache
    await validateCache(req, postId);

    logger.info("Post deleted successfully", { postId });
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    logger.error("delete post error", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
};
