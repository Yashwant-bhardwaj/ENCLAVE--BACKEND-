import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";
import { connectKafka, disconnectKafka } from "./config/kafka.js";
import { startContactConsumer } from "./workers/contact.consumer.js";

const PORT = process.env.PORT || 8888;

const startServer = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);

    await connectDB();
    console.log("MongoDB Connected");

    // Connect to Kafka
    await connectKafka();
    // Start consumer worker
    await startContactConsumer();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      console.log(`Server running on http://localhost:${PORT}`);
    });

    // Graceful Shutdown
    const gracefulShutdown = async () => {
      logger.info("Graceful shutdown initiated...");
      server.close(async () => {
        logger.info("HTTP server closed.");
        await disconnectKafka();
        process.exit(0);
      });
    };

    process.on("SIGINT", gracefulShutdown);
    process.on("SIGTERM", gracefulShutdown);
  } catch (error) {
    console.error(error);
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();