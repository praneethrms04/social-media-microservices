const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const logger = require("./logger");
const { AWS_S3_BUCKET } = require("../config");
const s3Client = require("./s3-credentials");

const deleteObject = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
    });

    const response = await s3Client.send(command);
    const statusCode = response?.$metadata?.httpStatusCode;

    if (![200, 204].includes(statusCode)) {
      logger.error("File Deletion failed", { statusCode, fileKey });
      return {
        status: statusCode || 400,
        data: response,
      };
    }

    logger.info("Image deleted successfully", fileKey);
    return {
      status: statusCode,
    };
  } catch (error) {
    logger.error("Error while deleting object", error);
  }
};

module.exports = deleteObject;
