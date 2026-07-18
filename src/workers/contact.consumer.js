import { consumer } from "../config/kafka.js";
import logger from "../utils/logger.js";

/**
 * Start the Kafka contact creation consumer
 */
export const startContactConsumer = async () => {
  try {
    await consumer.subscribe({ topic: "contact-topic", fromBeginning: true });
    logger.info("Subscribed to 'contact-topic' successfully");

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          logger.info(`[Kafka Consumer] Processed event from topic '${topic}' on partition ${partition}:`);
          logger.info(`  - ID: ${payload.id}`);
          logger.info(`  - Name: ${payload.name}`);
          logger.info(`  - Email: ${payload.email}`);
          logger.info(`  - Subject: ${payload.subject}`);
          logger.info(`  - Message: ${payload.message}`);
          logger.info(`  - CreatedAt: ${payload.createdAt}`);
          
          // Simulated downstream microservice action: e.g., email notification, auditing, webhook dispatch
          logger.info(`[Notification Service] Automated notification email successfully sent to: ${payload.email}`);
        } catch (err) {
          logger.error(`Error processing individual Kafka message: ${err.message}`);
        }
      },
    });
  } catch (error) {
    logger.error(`Kafka Consumer worker failed to start: ${error.message}`);
  }
};
