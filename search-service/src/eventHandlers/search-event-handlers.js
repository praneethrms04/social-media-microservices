const Search = require("../models/model.search");
const logger = require("../utils/logger");

const handlePostCreated = async (event) => {
  // await publishEvent("social.post.created", {
  //   postId: createNewPost._id.toString(),
  //   userId: createNewPost.user.toString(),
  //   content: createNewPost.content,
  //   createdAt: createNewPost.createdAt,
  // });
  const { postId, userId, content, createdAt } = event;
  try {
    const newSearchPost = new Search({
      postId,
      userId,
      content,
      createdAt,
    });
    await newSearchPost.save();

    logger.info(
      ` search post creaed : ${postId}, ${newSearchPost._id.toString()}`
    );
  } catch (error) {
    logger.error("Error while post creation - search event", error);
    console.error("Error while post creation - search event", error);
  }
};

const handlePostDeleted = async (event) => {
  // await publishEvent("social.post.deleted", {
  //   postId: post._id.toString(),
  //   userId: req.user.userId,
  //   mediaIds: post.mediaIds,
  // });

  const { postId } = event;

  try {
    await Search.findOneAndDelete({ postId: postId });
    logger.info("search post deleted", postId);
  } catch (error) {
    logger.error("error while deleting the post on search-event", error);
    console.error("error while deleting the post on search-event", error);
  }
};

module.exports = {
  handlePostDeleted,
  handlePostCreated,
};
