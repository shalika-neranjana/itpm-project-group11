/**
 * Main Express application configuration.
 * Registers middleware and routes.
 */

const express = require("express");
const cors = require("cors");

const errorHandler = require("./middleware/errorMiddleware");

const app = express();

/**
 * Global middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Health check route
 */
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Intern Connect API is running",
    });
});

/**
 * Error handling middleware
 * Keep this after routes.
 */
app.use(errorHandler);

module.exports = app;