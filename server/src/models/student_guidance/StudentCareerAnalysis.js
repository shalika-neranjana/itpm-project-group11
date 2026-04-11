const mongoose = require("mongoose");

const studentCareerAnalysisSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        careerId: {
            type: String,
            required: true,
            trim: true,
        },
        report: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
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

studentCareerAnalysisSchema.index({ student: 1, careerId: 1 }, { unique: true });

module.exports = mongoose.model("StudentCareerAnalysis", studentCareerAnalysisSchema);
