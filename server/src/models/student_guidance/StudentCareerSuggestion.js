const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        summary: {
            type: String,
            required: true,
            trim: true,
        },
        nextStep: {
            type: String,
            required: true,
            trim: true,
        },
        matchScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        matchedAreas: {
            type: [String],
            default: [],
        },
    },
    { _id: false }
);

const studentCareerSuggestionSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            unique: true,
            index: true,
        },
        suggestions: {
            type: [suggestionSchema],
            default: [],
        },
        source: {
            type: String,
            enum: ["ai", "fallback"],
            default: "ai",
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StudentCareerSuggestion", studentCareerSuggestionSchema);
