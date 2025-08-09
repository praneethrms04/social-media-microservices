const mongoose = require("mongoose");
const { app } = require("./app");
const { config } = require("./config");
const logger = require("./utils/logger");
const { connecRabbitMQ } = require("./utils/rabbitmq");

async function main() {
  try {
    await mongoose.connect(config.db_url);

    app.listen(config.port, () => {
      logger.info(`Post service running on port ${config.port}`);
      connecRabbitMQ();
    });
  } catch (error) {
    logger.error("Failed to connect", error);
  }
}
main()
  .then(() => {
    logger.info("MongoDB connected Success");
  })
  .catch((err) => {
    console.log(`mongo not coonected, ${err.message}`);
  });
