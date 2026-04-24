/**
 * Internship model for tracking student internships
 */

const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    studentIdNumber: {
      type: String,
      required: true,
      trim: true,
    },

    // Display name 
    studentName: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    supervisorName: {
      type: String,
      required: true,
      trim: true,
    },

    supervisorEmail: {
      type: String,
      trim: true,
      default: "",
    },

    startDate: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    endDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ongoing", "completed"],
      default: "ongoing",
    },
  },
  {
    timestamps: true,
  }
);

const StudentInternship = mongoose.model("StudentInternship", internshipSchema);

module.exports = StudentInternship;