import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";

const PORT = process.env.PORT || 8888;

const startServer = async () => {
  try {
    console.log("MONGODB_URI:", process.env.MONGODB_URI);



    await connectDB();
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();