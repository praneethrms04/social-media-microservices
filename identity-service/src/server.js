const mongoose = require("mongoose");
const { app } = require("./app");
const { config } = require("./config/index");
const logger = require("./utils/logger");


async function main() {
  await mongoose.connect(config.db_url);

  app.listen(config.port, () => {
    logger.info(`Identity service running on port ${config.port}`);
  });
}
main()
  .then(() => {
    logger.info("MongoDB connected Success");
  })
  .catch((err) => {
    console.log(`mongo not coonected, ${err.message}`);
  });
