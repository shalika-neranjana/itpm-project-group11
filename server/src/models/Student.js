/**
 * Student model for authentication and profile management.
 * This is the first core model of the Intern Connect application.
 */

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
    {
        studentId: {
            type: String,
            required: [true, "Student ID is required"],
            trim: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
        },
        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            unique: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 6,
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },
        linkedin: {
            type: String,
            default: "",
            trim: true,
        },
        university: {
            type: String,
            default: "",
            trim: true,
        },
        faculty: {
            type: String,
            default: "",
            trim: true,
        },
        specialization: {
            type: String,
            enum: ["Computer Science", "Software Engineering", "Data Science", "Multimedia", "Cybersecurity"],
            default: "Computer Science",
        },
        gpa: {
            type: Number,
            min: 0,
            max: 4,
            default: 0,
        },
        skills: [{
            type: String,
            trim: true,
        }],
        resume: {
            type: String,
            default: "",
        },
        github: {
            type: String,
            default: "",
            trim: true,
        },
        bio: {
            type: String,
            default: "",
            trim: true,
        },
        suspended: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;