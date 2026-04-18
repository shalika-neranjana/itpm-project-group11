const mongoose = require("mongoose");

const careerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        matchTags: {
            type: [String],
            required: true,
            default: [],
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
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Career", careerSchema);
