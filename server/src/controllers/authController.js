/**
 * Authentication controller for student registration and login.
 */

const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Company = require("../models/Company");
const generateToken = require("../utils/generateToken");
const { deleteUploadedFile, getUploadedFilePath } = require("../utils/uploadUtils");

/**
 * @desc    Register a new student
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerStudent = async (req, res, next) => {
    let registrationCompleted = false;

    try {
        const {
            studentId,
            firstName,
            lastName,
            email,
            password,
            phone,
            linkedin,
            faculty,
            github,
            profileImage,
        } = req.body;
        const normalizedStudentId = studentId?.trim().toUpperCase();
        const normalizedEmail = email?.trim().toLowerCase();
        const normalizedPhone = phone?.trim();
        const uploadedProfileImage = getUploadedFilePath(req.file, "avatars", profileImage);

        // Validate required fields
        if (!studentId || !firstName || !lastName || !email || !password || !phone) {
            res.status(400);
            throw new Error("Please provide all required fields");
        }

        if (!uploadedProfileImage) {
            res.status(400);
            throw new Error("Profile photo is required");
        }

        // Check whether a student with the same email already exists
        const existingStudentByEmail = await Student.findOne({ email: normalizedEmail });
        if (existingStudentByEmail) {
            res.status(400);
            throw new Error("A student with this email already exists");
        }

        // Ensure email is unique across all account types
        const existingCompanyByEmail = await Company.findOne({ email: normalizedEmail });
        if (existingCompanyByEmail) {
            res.status(400);
            throw new Error("This email is already registered");
        }

        // Check whether a student with the same student ID already exists
        const existingStudentById = await Student.findOne({ studentId: normalizedStudentId });
        if (existingStudentById) {
            res.status(400);
            throw new Error("A student with this student ID already exists");
        }

        if (normalizedPhone) {
            const existingStudentByPhone = await Student.findOne({ phone: normalizedPhone });
            if (existingStudentByPhone) {
                res.status(400);
                throw new Error("A student with this phone number already exists");
            }

            const existingCompanyByPhone = await Company.findOne({ phone: normalizedPhone });
            if (existingCompanyByPhone) {
                res.status(400);
                throw new Error("This phone number is already registered");
            }
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create student
        const student = await Student.create({
            studentId: normalizedStudentId,
            firstName,
            lastName,
            email: normalizedEmail,
            password: hashedPassword,
            phone: normalizedPhone,
            linkedin,
            faculty,
            github,
            profileImage: uploadedProfileImage,
        });

        registrationCompleted = true;

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
                faculty: student.faculty,
                github: student.github,
                profileImage: student.profileImage,
                suspended: student.suspended,
                token: generateToken(student._id),
            },
        });
    } catch (error) {
        if (!registrationCompleted) {
            deleteUploadedFile(req.file);
        }

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

        // Check if student is suspended
        if (student.suspended) {
            res.status(403);
            throw new Error("Account suspended. Please contact administrator.");
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
                suspended: student.suspended,
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
