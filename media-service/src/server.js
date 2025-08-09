const mongoose = require("mongoose");
const { app } = require("./app");
const { db_url, port } = require("./config");
const logger = require("./utils/logger");
const { connecRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const handlePostDelete = require("./eventHandlers/media-event-handlers");

async function main() {
  await mongoose.connect(db_url);

  app.listen(port, () => {
    logger.info(`Media service running on port ${port}`);
    connecRabbitMQ();
    //consume all the events & delete
    consumeEvent("social.post.deleted",handlePostDelete )
  });
}
main()
  .then(() => {
    logger.info("MongoDB connected Success");
  })
  .catch((err) => {
    console.log(`mongo not coonected, ${err.message}`);
  });
