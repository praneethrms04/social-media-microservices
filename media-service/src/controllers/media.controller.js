const logger = require("../utils/logger");
const multer = require("multer");
const { v4 } = require("uuid");
const s3Client = require("../utils/s3-credentials");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const putObject = require("../utils/putObject");
const Media = require("../models/media.model");

/**
 * access : private
 * /api/v1/media/upload
 * desc : upload a media
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const uploadMedia = async (req, res, next) => {
  logger.info("Uploading media api hit...");

  try {
    if (!req.files || !req.files.file) {
      logger.error("No file found. Please add a file and try again!");
      return res.status(400).json({
        success: false,
        message: "No file found. Please add a file and try again!",
      });
    }

    const file = req.files.file;
    const fileKey = `images/${v4()}-${file.name}`;
    const mimetype = file.mimetype;
    const userId = req.user.userId;

    logger.info(`Uploading to S3: ${fileKey}`);
    const url = await putObject(file, fileKey);

    const newMedia = new Media({
      publicId: fileKey,
      originalName: file.name,
      mimetype,
      url,
      userId,
    });

    await newMedia.save();

    res.status(200).json({
      success: true,
      mediaId: newMedia._id,
      url: newMedia.url,
      message: "Media uploaded successfully",
    });
  } catch (error) {
    logger.error("Error uploading media: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload media",
    });
  }
};

/**
 * @desc Get Media URLS
 * @route GET Media Urls
 * @access public
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */

const getMediaUrls = async (req, res, next) => {
  logger.info("Fetching media URLs...");
  try {
    const userId = req.user.userId;
    console.log(userId);

    const result = await Media.find({ userId: req.user.userId });

    if (result.length === 0) {
      res.status(400).json({
        success: false,
        message: "Can't find any Media for this User",
      });
    }

    res.status(200).json({
      success: true,
      message: "Media URLs fetched successfully",
      data: result,
    });
  } catch (error) {
    logger.error("Error fetching media URLs: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch media URLs",
    });
  }
};



module.exports = { uploadMedia, getMediaUrls };
