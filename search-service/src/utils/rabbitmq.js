const amqp = require("amqplib");
const logger = require("./logger");
const { config } = require("../config");

let connection = null;
let channel = null;
const EXCHANGE_NAME = "facebook_events_topic";

async function connecRabbitMQ() {
  try {
    connection = await amqp.connect(config.RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: false });
    logger.info("Connected to rabbitMQ in Media Service");
    return channel;
  } catch (error) {
    console.log(error);
    logger.error("RabbitMQ connection error in Media-service", error);
  }
}

async function consumeEvent(routingKey, callback) {
  if (!channel) {
    await connecRabbitMQ();
  }

  const { queue } = await channel.assertQueue("", { exclusive: true });
  await channel.bindQueue(queue, EXCHANGE_NAME, routingKey);

  channel.consume(queue, (msg) => {
    const content = JSON.parse(msg.content.toString());
    callback(content);
    channel.ack(msg);
  });
  console.log("Subscribed to Event:", routingKey);
  logger.info("Subscribed to Event:", routingKey);
}

module.exports = {
  connecRabbitMQ,
  consumeEvent,
};
