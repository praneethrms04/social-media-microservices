const app = require("./app");
const {
  PORT,
  IDENTITY_SERVICE_URL,
  POST_SERVICE_URL,
  MEDIA_SERVICE_URL,
  SEARCH_SERVICE_URL,
} = require("./config");
const logger = require("./utils/logger");

async function main() {
  app.listen(PORT, () => {
    logger.info(`API Gateway is running on port ${PORT}`);
    logger.info(`Identity Service URL: ${IDENTITY_SERVICE_URL}`);
    logger.info(`Post Service URL: ${POST_SERVICE_URL}`);
    logger.info(`Media Service URL: ${MEDIA_SERVICE_URL}`);
    logger.info(`Search Service URL: ${SEARCH_SERVICE_URL}`);
  });
}

main()
  .then(() => {
    console.log("API Gateway started successfully");
  })
  .catch((err) => {
    console.error(`API Gateway failed to start: ${err.message}`);
  });
