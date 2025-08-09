const Media = require("../models/media.model");
const deleteObject = require("../utils/deleteObject");
const logger = require("../utils/logger");
// await publishEvent("social.post.deleted", {
//   postId: post._id.toString(),
//   userId: req.user.userId,
//   mediaIds: post.mediaIds,
// });
const handlePostDelete = async (event) => {
  const { postId, mediaIds, userId } = event;
  console.log({
    postId,
    userId,
    mediaIds,
  });
  try {
    if (!mediaIds || mediaIds.length === 0) return;

    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });
    // console.log(mediaToDelete);

    for (const media of mediaToDelete) {
      console.log(media);
      if (media.publicId) {
        await deleteObject(media.publicId);
      }
      await Media.findByIdAndDelete(media._id);
    }
    logger.info(
      `Deleted ${mediaToDelete.length} media files for post ${postId}`
    );
  } catch (error) {
    console.log(error);
    logger.error("error occured while deleting media");
  }
};

module.exports = handlePostDelete;
