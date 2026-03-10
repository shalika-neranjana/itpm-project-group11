/**
 * Student profile controller.
 */

const Student = require("../models/Student");
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
        student.degreeProgram = req.body.degreeProgram || student.degreeProgram;
        student.academicYear = req.body.academicYear || student.academicYear;
        student.phone = req.body.phone || student.phone;
        student.linkedin = req.body.linkedin || student.linkedin;

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

module.exports = {
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
};