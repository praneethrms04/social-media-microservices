const { PutObjectCommand } = require("@aws-sdk/client-s3");
const logger = require("./logger");
const s3Client = require("./s3-credentials");
const { AWS_S3_BUCKET, AWS_REGION } = require("../config");

const putObject = async (file, fileKey) => {
  try {
    const input = {
      Bucket: AWS_S3_BUCKET,
      Key: fileKey,
      Body: file.data,
      //   ContentType: file.mimeType,
      ContentType: "image/jpg,jpeg,png",
      // ContentType: "video/mp4,mkv", //For Video
      acl: "public-read",
    };
    const data = await s3Client.send(new PutObjectCommand(input));
    if (data.$metadata.httpStatusCode !== 200) {
      return logger.error("File upload failed");
    }
    const url = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${fileKey}`;
    logger.info("file uploaded successfully", url);
    return url;
  } catch (error) {
    logger.error("Error while uploading to s3 bucket", error);
    console.error(error);
  }
};
module.exports = putObject;
