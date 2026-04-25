/**
 * Internship model for job postings
 */

const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Internship title is required"],
            trim: true,
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: [true, "Company is required"],
        },
        specialization: {
            type: String,
            required: [true, "Specialization is required"],
            enum: ["Computer Science", "Software Engineering", "Data Science", "Multimedia", "Cybersecurity"],
        },
        type: {
            type: String,
            required: [true, "Internship type is required"],
            enum: ["On-site", "Remote", "Hybrid"],
        },
        duration: {
            type: String,
            required: [true, "Duration is required"],
            trim: true,
        },
        location: {
            type: String,
            required: [true, "Location is required"],
            trim: true,
        },
        stipend: {
            type: String,
            required: [true, "Stipend is required"],
            trim: true,
        },
        deadline: {
            type: Date,
            required: [true, "Deadline is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        overview: {
            type: String,
            trim: true,
        },
        duties: [{
            type: String,
            trim: true,
        }],
        requirements: [{
            type: String,
            trim: true,
        }],
        slots: {
            type: Number,
            required: [true, "Number of slots is required"],
            min: [1, "At least 1 slot is required"],
        },
        status: {
            type: String,
            enum: ["Published", "Draft", "Closed"],
            default: "Draft",
        },
        applications: [{
            student: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
            },
            name: {
                type: String,
                required: true,
            },
            email: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
            },
            coverLetter: {
                type: String,
                required: true,
            },
            resume: {
                type: String,
            },
            status: {
                type: String,
                enum: ["Pending", "Accepted", "Rejected"],
                default: "Pending",
            },
            appliedDate: {
                type: Date,
                default: Date.now,
            },
            interview: {
                mode: {
                    type: String,
                    enum: ["Online", "Onsite"],
                },
                date: {
                    type: Date,
                },
                time: {
                    type: String,
                    trim: true,
                },
                place: {
                    type: String,
                    trim: true,
                },
                supervisorEmail: {
                    type: String,
                    trim: true,
                },
                supervisorContact: {
                    type: String,
                    trim: true,
                },
                scheduledAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        }],
    },
    {
        timestamps: true,
    }
);

// Indexes to speed up common listing and filtering queries
internshipSchema.index({ status: 1, specialization: 1, type: 1, deadline: -1 });
internshipSchema.index({ company: 1, createdAt: -1 });
internshipSchema.index({ "applications.student": 1 });

module.exports = mongoose.model("Internship", internshipSchema);
