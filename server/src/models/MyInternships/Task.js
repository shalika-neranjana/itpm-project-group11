/**
 * Task model for internship task management
 */

const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
{
    internship: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Internship",
        required: true,
    },

    taskName: {
        type: String,
        required: true,
        trim: true,
    },

    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium",
    },

    dueDate: {
        type: Date,
        required: true,
    },

    completed: {
        type: Boolean,
        default: false,
    }
},
{
    timestamps: true,
}
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;