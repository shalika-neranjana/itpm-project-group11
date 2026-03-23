/**
 * Daily Diary model for tracking daily internship activities
 */

const mongoose = require("mongoose");

const dailyDiarySchema = new mongoose.Schema(
{
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
        required: true,
    },

    date: {
        type: Date,
        required: true,
    },

    title: {
        type: String,
        required: true,
        trim: true,
    },

    description: {
        type: String,
        required: true,
        trim: true,
    },

    startTime: {
        type: String,
        required: true,
    },

    endTime: {
        type: String,
        required: true,
    },

    workingHours: {
        type: Number,
    },

    attachments: [
  {
    type: String
  }
]
},
{
    timestamps: true,
}
);

const DailyDiary = mongoose.model("DailyDiary", dailyDiarySchema);

module.exports = DailyDiary;