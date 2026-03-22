const mongoose = require("mongoose");

const examSubjectSchema = new mongoose.Schema(
    {
        subjectCode: {
            type: String,
            required: true,
            trim: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        credits: {
            type: Number,
            required: true,
            min: 0,
        },
        caPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        grade: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const examSemesterSchema = new mongoose.Schema(
    {
        year: {
            type: Number,
            required: true,
            min: 1,
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
        },
        subjects: {
            type: [examSubjectSchema],
            default: [],
        },
    },
    { _id: false }
);

const interestSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        level: {
            type: String,
            required: true,
            enum: ["Beginner", "Intermediate", "Advanced"],
        },
    },
    { _id: false }
);

const studentGuidanceSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            unique: true,
        },
        examResults: {
            type: [examSemesterSchema],
            default: [],
        },
        interests: {
            type: [interestSchema],
            default: [],
        },
        skills: {
            type: [skillSchema],
            default: [],
        },
        aspirations: {
            type: String,
            default: "",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("StudentGuidance", studentGuidanceSchema);
