/**
 * Centralized error-handling middleware.
 * Returns a consistent JSON error response.
 */

const multer = require("multer");

const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const isFileTooLarge = err.code === "LIMIT_FILE_SIZE";
    res.status(400).json({
      success: false,
      message: isFileTooLarge ? "Image size must be 5MB or less" : err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
    return;
  }

  if (err.message === "Only image files are allowed") {
    res.status(400).json({
      success: false,
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
    return;
  }

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;