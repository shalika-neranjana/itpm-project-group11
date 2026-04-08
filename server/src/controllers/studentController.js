/**
 * Student profile controller.
 */

const Student = require("../models/Student");
const Notification = require("../models/Notification");
const bcrypt = require("bcryptjs");

/**
 * @desc    Get logged-in student profile
 * @route   GET /api/students/profile
 * @access  Private
 */
const getStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findById(req.student._id).select("-password");

        res.status(200).json({
            success: true,
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update student profile
 * @route   PUT /api/students/profile
 * @access  Private
 */
const updateStudentProfile = async (req, res, next) => {
    try {
        const student = await Student.findById(req.student._id);

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        student.firstName = req.body.firstName || student.firstName;
        student.lastName = req.body.lastName || student.lastName;
        student.email = req.body.email || student.email;
        student.phone = req.body.phone || student.phone;
        student.linkedin = req.body.linkedin || student.linkedin;
        student.university = req.body.university || student.university;
        student.faculty = req.body.faculty || student.faculty;
        student.specialization = req.body.specialization || student.specialization;
        student.gpa = req.body.gpa || student.gpa;
        student.skills = req.body.skills || student.skills;
        student.resume = req.body.resume || student.resume;
        student.github = req.body.github || student.github;
        student.bio = req.body.bio || student.bio;

        // If password update requested
        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            student.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedStudent = await student.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: updatedStudent,
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete student account
 * @route   DELETE /api/students/profile
 * @access  Private
 */
const deleteStudentProfile = async (req, res, next) => {
    try {
        await Student.findByIdAndDelete(req.student._id);

        res.status(200).json({
            success: true,
            message: "Student account deleted successfully",
        });

    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get student notifications
 * @route   GET /api/students/notifications
 * @access  Private
 */
const getStudentNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ student: req.student._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Mark notification as read
 * @route   PUT /api/students/notifications/:id/read
 * @access  Private
 */
const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, student: req.student._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            res.status(404);
            throw new Error("Notification not found");
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    getStudentNotifications,
    markNotificationAsRead,
};