/**
 * Main Express application configuration.
 * Registers middleware and routes.
 */

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const errorHandler = require("./middleware/errorMiddleware");

const studentRoutes = require("./routes/studentRoutes");
const studentGuidanceRoutes = require("./routes/student_guidance/studentGuidanceRoutes");

/* MyInternships routes */
const internshipRoutes = require("./routes/MyInternships/internshipRoutes");
const dailyDiaryRoutes = require("./routes/MyInternships/dailyDiaryRoutes");
const taskRoutes = require("./routes/MyInternships/taskRoutes");
const monthlyReportRoutes = require("./routes/MyInternships/monthlyReportRoutes");
const finalReportRoutes = require("./routes/MyInternships/finalReportRoutes");

const app = express();

/**
 * Global middleware
 */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/students", studentRoutes);
app.use("/api/student-guidance", studentGuidanceRoutes);

/**
 * My Internships routes
 */

app.use("/api/internships", internshipRoutes);
app.use("/api/diary", dailyDiaryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/monthly-reports", monthlyReportRoutes);
app.use("/api/final-reports", finalReportRoutes);

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
