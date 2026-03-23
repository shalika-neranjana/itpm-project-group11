const mongoose = require("mongoose");
require("./Module");

const resultSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        module: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Module",
            required: true,
        },
        caMarks: {
            type: Number,
            required: true,
        },
        grade: {
            type: String,
            trim: true,
            required: true,
        },
    },
    {
        collection: "results",
    }
);

module.exports = mongoose.models.Result || mongoose.model("Result", resultSchema);
