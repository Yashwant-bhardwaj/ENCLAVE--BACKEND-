import mongoose from "mongoose";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    logger.info(
      `MongoDB Connected : ${connection.connection.host}`
    );
  } catch (error) {
    logger.error(`MongoDB Connection Failed : ${error.message}`);
    logger.warn("Running in Offline DB Mode (In-Memory fallback will be used)");
  }
};

export default connectDB;