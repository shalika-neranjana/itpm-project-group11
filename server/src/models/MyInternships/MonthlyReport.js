const mongoose = require("mongoose");

const monthlyReportSchema = new mongoose.Schema(
{
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
        required: true,
    },

    month: {
        type: String, 
        required: true,
    },

    weekSummary: {
        week01: { type: String, default: "" },
        week02: { type: String, default: "" },
        week03: { type: String, default: "" },
        week04: { type: String, default: "" },
    },

    skillsLearned: [
        { type: String } 
    ],

    attachments: [
        { type: String } 
    ]

},
{
    timestamps: true,
});

module.exports = mongoose.model("MonthlyReport", monthlyReportSchema);