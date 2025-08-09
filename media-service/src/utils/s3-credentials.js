const { S3Client } = require("@aws-sdk/client-s3");
const { AWS_REGION, AWS_ACCESS_KEY, AWS_SECRET_KEY } = require("../config");

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
});

module.exports = s3Client;
