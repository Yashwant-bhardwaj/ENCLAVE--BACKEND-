import { Kafka } from "kafkajs";
import { EventEmitter } from "events";
import logger from "../utils/logger.js";

const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const USE_REAL_KAFKA = process.env.USE_REAL_KAFKA === "true";

class MockKafka {
  constructor() {
    this.emitter = new EventEmitter();
  }

  producer() {
    return {
      connect: async () => logger.info("[Mock Kafka] Producer connected successfully"),
      disconnect: async () => logger.info("[Mock Kafka] Producer disconnected"),
      send: async ({ topic, messages }) => {
        for (const msg of messages) {
          logger.info(`[Mock Kafka] Event published to topic '${topic}'`);
          // Simulate latency
          setTimeout(() => {
            this.emitter.emit(topic, {
              value: Buffer.from(msg.value),
              key: msg.key ? Buffer.from(msg.key) : null,
            });
          }, 150);
        }
      }
    };
  }

  consumer() {
    return {
      connect: async () => logger.info("[Mock Kafka] Consumer connected successfully"),
      disconnect: async () => logger.info("[Mock Kafka] Consumer disconnected"),
      subscribe: async ({ topic }) => {
        this.subscribedTopic = topic;
        logger.info(`[Mock Kafka] Subscribed to topic '${topic}'`);
      },
      run: async ({ eachMessage }) => {
        this.emitter.on(this.subscribedTopic, (message) => {
          eachMessage({
            topic: this.subscribedTopic,
            partition: 0,
            message,
          }).catch(err => logger.error(`[Mock Kafka] Consumer Error: ${err.message}`));
        });
        logger.info("[Mock Kafka] Consumer running...");
      }
    };
  }
}

let activeProducer;
let activeConsumer;
let isMock = true;

if (USE_REAL_KAFKA) {
  try {
    const kafka = new Kafka({
      clientId: "enclave-portal",
      brokers: [KAFKA_BROKER],
    });
    activeProducer = kafka.producer();
    activeConsumer = kafka.consumer({ groupId: "enclave-portal-group" });
    isMock = false;
    logger.info("Real Kafka client initialized.");
  } catch (error) {
    logger.warn(`Failed to initialize real Kafka: ${error.message}. Falling back to Mock Kafka.`);
    const mock = new MockKafka();
    activeProducer = mock.producer();
    activeConsumer = mock.consumer();
    isMock = true;
  }
} else {
  logger.info("Running in Mock Kafka mode (USE_REAL_KAFKA is not set to 'true').");
  const mock = new MockKafka();
  activeProducer = mock.producer();
  activeConsumer = mock.consumer();
  isMock = true;
}

export const producer = {
  connect: () => activeProducer.connect(),
  disconnect: () => activeProducer.disconnect(),
  send: (payload) => activeProducer.send(payload),
};

export const consumer = {
  connect: () => activeConsumer.connect(),
  disconnect: () => activeConsumer.disconnect(),
  subscribe: (payload) => activeConsumer.subscribe(payload),
  run: (payload) => activeConsumer.run(payload),
};

/**
 * Connect Kafka Producer and Consumer
 */
export const connectKafka = async () => {
  try {
    if (!isMock) {
      logger.info(`Connecting to real Kafka broker at: ${KAFKA_BROKER}`);
      await activeProducer.connect();
      await activeConsumer.connect();
      logger.info("Connected to real Kafka successfully");
    } else {
      await activeProducer.connect();
      await activeConsumer.connect();
      logger.info("Mock Kafka connected successfully");
    }
  } catch (error) {
    logger.error(`Real Kafka Connection Failed: ${error.message}. Switching to Mock Kafka fallback...`);
    const mock = new MockKafka();
    activeProducer = mock.producer();
    activeConsumer = mock.consumer();
    isMock = true;
    await activeProducer.connect();
    await activeConsumer.connect();
    logger.info("Connected to Mock Kafka fallback successfully");
  }
};

/**
 * Disconnect Kafka clients
 */
export const disconnectKafka = async () => {
  try {
    await activeProducer.disconnect();
    await activeConsumer.disconnect();
    logger.info("Kafka disconnected successfully");
  } catch (error) {
    logger.error(`Kafka Disconnection Error: ${error.message}`);
  }
};

/**
 * Publish contact submission event
 */
export const publishContactEvent = async (contact) => {
  try {
    await producer.send({
      topic: "contact-topic",
      messages: [
        {
          key: contact._id.toString(),
          value: JSON.stringify({
            id: contact._id,
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            createdAt: contact.createdAt || new Date(),
          }),
        },
      ],
    });
    logger.info(`Kafka event published to contact-topic for ID: ${contact._id}`);
  } catch (error) {
    logger.error(`Failed to publish contact event: ${error.message}`);
  }
};
