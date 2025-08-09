const amqp = require("amqplib");
const logger = require("./logger");
const { config } = require("../config");

let connection = null;
let channel = null;
const EXCHANGE_NAME = "facebook_events_topic";

async function connecRabbitMQ(retries = 5, delay = 3000) {
  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false });
    // assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info("Connected to rabbitMQ");
    return channel;
  } catch (error) {
    console.log(error);
    logger.error("RabbitMQ connection error", error);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connecRabbitMQ();
  }
  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
}

module.exports = {
  connecRabbitMQ,
  publishEvent,
};
