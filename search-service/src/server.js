const mongoose = require("mongoose");
const { app } = require("./app");
const { config } = require("./config");
const logger = require("./utils/logger");
const { connecRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./eventHandlers/search-event-handlers");

async function main() {
  await mongoose.connect(config.db_url);

  app.listen(config.port, () => {
    logger.info(`Search service running on port ${config.port}`);
    connecRabbitMQ();
    //consume the events / subscribe to the events
    consumeEvent("social.post.created", handlePostCreated);
    consumeEvent("social.post.deleted", handlePostDeleted);
  });
}
main()
  .then(() => {
    logger.info("MongoDB connected Success");
  })
  .catch((err) => {
    console.log(`mongo not coonected, ${err.message}`);
  });
