/**
 * CompanyReview model for storing and managing company reviews.
 * Students can write reviews about companies they've interned with.
 */

const mongoose = require("mongoose");

const companyReviewSchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            index: true,
        },
        title: {
            type: String,
            required: [true, "Review title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"],
        },
        description: {
            type: String,
            required: [true, "Review description is required"],
            trim: true,
            minlength: [20, "Description must be at least 20 characters"],
            maxlength: [5000, "Description cannot exceed 5000 characters"],
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
        },
        position: {
            type: String,
            trim: true,
            default: "",
        },
        internshipType: {
            type: String,
            enum: ["Summer", "Winter", "Spring", "Fall", "Full-Time", "Part-Time", "Other"],
            default: "Summer",
        },
        salary: {
            type: Number,
            default: null,
        },
        salaryFrequency: {
            type: String,
            enum: ["Hourly", "Monthly", "Yearly"],
            default: null,
        },
        authorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Author ID is required"],
            index: true,
        },
        authorName: {
            type: String,
            default: "Anonymous",
        },
        flagged: {
            type: Boolean,
            default: false,
            index: true,
        },
        flagReason: {
            type: String,
            default: "",
        },
        helpful: {
            type: Number,
            default: 0,
        },
        unhelpful: {
            type: Number,
            default: 0,
        },
        workEnvironment: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        mentorship: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },
        parkingAvailable: {
            type: Boolean,
            default: null,
        },
        reviewCategory: {
            type: String,
            enum: ["General", "Compensation", "Culture", "Technical Learning", "Other"],
            default: "General",
        },
    },
    {
        timestamps: true,
    }
);

// Index for better query performance
companyReviewSchema.index({ companyName: 1, createdAt: -1 });
companyReviewSchema.index({ authorId: 1, createdAt: -1 });
companyReviewSchema.index({ rating: 1 });

module.exports = mongoose.model("CompanyReview", companyReviewSchema);
