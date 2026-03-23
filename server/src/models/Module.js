const mongoose = require("mongoose");

const moduleSchema = new mongoose.Schema(
    {
        module_name: {
            type: String,
            trim: true,
            required: true,
        },
        module_code: {
            type: String,
            trim: true,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        semester: {
            type: Number,
            required: true,
        },
        credit_points: {
            type: Number,
            required: true,
        },
    },
    {
        collection: "modules",
    }
);

module.exports = mongoose.models.Module || mongoose.model("Module", moduleSchema);
