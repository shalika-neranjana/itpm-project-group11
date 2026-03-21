/**
 * Main Express application configuration.
 * Registers middleware and routes.
 */

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/Profiles/adminRoutes");
const companyRoutes = require("./routes/companyRoutes");
const internshipRoutes = require("./routes/internshipRoutes");

const app = express();

/**
 * Global middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/internships", internshipRoutes);

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
 * Application routes
 */
app.use("/api/auth", authRoutes);

/**
 * Error handling middleware
 * Keep this after routes.
 */
app.use(errorHandler);

module.exports = app;