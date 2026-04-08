/**
 * Notification model for student notifications.
 */

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: [true, "Student is required"],
        },
        message: {
            type: String,
            required: [true, "Message is required"],
            trim: true,
        },
        type: {
            type: String,
            required: [true, "Type is required"],
            enum: ["application_accepted", "application_rejected", "other"],
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Notification", notificationSchema);