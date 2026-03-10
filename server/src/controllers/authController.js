/**
 * Authentication controller for student registration and login.
 */

const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const generateToken = require("../utils/generateToken");

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerStudent = async (req, res, next) => {
    try {
        const {
            studentId,
            firstName,
            lastName,
            email,
            password,
            phone,
            linkedin,
            profileImage,
        } = req.body;

        // Validate required fields
        if (!studentId || !firstName || !lastName || !email || !password) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        // Check whether a student with the same email already exists
        const existingStudentByEmail = await Student.findOne({ email });
        if (existingStudentByEmail) {
            res.status(400);
            throw new Error("A student with this email already exists");
        }

        // Check whether a student with the same student ID already exists
        const existingStudentById = await Student.findOne({ studentId });
        if (existingStudentById) {
            res.status(400);
            throw new Error("A student with this student ID already exists");
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create student
        const student = await Student.create({
            studentId,
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            linkedin,
            profileImage,
        });

        res.status(201).json({
            success: true,
            message: "Student registered successfully",
            data: {
                _id: student._id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                linkedin: student.linkedin,
                profileImage: student.profileImage,
                token: generateToken(student._id),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Login student
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginStudent = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            res.status(400);
            throw new Error("Email and password are required");
        }

        // Find student by email
        const student = await Student.findOne({ email });

        if (!student) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        // Compare password
        const isPasswordMatched = await bcrypt.compare(password, student.password);

        if (!isPasswordMatched) {
            res.status(401);
            throw new Error("Invalid email or password");
        }

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                _id: student._id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                linkedin: student.linkedin,
                profileImage: student.profileImage,
                token: generateToken(student._id),
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerStudent,
    loginStudent,
};