import logger from "../utils/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack || err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
};

export default errorHandler;