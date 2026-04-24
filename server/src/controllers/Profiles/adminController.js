/**
 * Admin controller for managing student and company accounts.
 */

const Student = require("../../models/Student");
const Company = require("../../models/Company");

/**
 * @desc    Get all students
 * @route   GET /api/admin/students
 * @access  Private (Admin only)
 */
const getAllStudents = async (req, res, next) => {
    try {
        const students = await Student.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Students retrieved successfully",
            data: students,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/admin/students/:id
 * @access  Private (Admin only)
 */
const getStudentById = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id).select("-password");

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        res.status(200).json({
            success: true,
            message: "Student retrieved successfully",
            data: student,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Suspend a student account
 * @route   PUT /api/admin/students/:id/suspend
 * @access  Private (Admin only)
 */
const suspendStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        student.suspended = true;
        await student.save();

        res.status(200).json({
            success: true,
            message: "Student suspended successfully",
            data: {
                _id: student._id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                linkedin: student.linkedin,
                suspended: student.suspended,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Unsuspend a student account
 * @route   PUT /api/admin/students/:id/unsuspend
 * @access  Private (Admin only)
 */
const unsuspendStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        student.suspended = false;
        await student.save();

        res.status(200).json({
            success: true,
            message: "Student unsuspended successfully",
            data: {
                _id: student._id,
                studentId: student.studentId,
                firstName: student.firstName,
                lastName: student.lastName,
                email: student.email,
                phone: student.phone,
                linkedin: student.linkedin,
                suspended: student.suspended,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a student account
 * @route   DELETE /api/admin/students/:id
 * @access  Private (Admin only)
 */
const deleteStudent = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        await Student.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Student deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update student profile (Admin version)
 * @route   PUT /api/admin/students/:id
 * @access  Private (Admin only)
 */
const updateStudentByAdmin = async (req, res, next) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            res.status(404);
            throw new Error("Student not found");
        }

        // Update fields
        student.studentId = req.body.studentId || student.studentId;
        student.firstName = req.body.firstName || student.firstName;
        student.lastName = req.body.lastName || student.lastName;
        student.email = req.body.email || student.email;
        student.phone = req.body.phone || student.phone;
        student.linkedin = req.body.linkedin || student.linkedin;
        student.suspended = req.body.suspended !== undefined ? req.body.suspended : student.suspended;

        const updatedStudent = await student.save();

        res.status(200).json({
            success: true,
            message: "Student updated successfully",
            data: {
                _id: updatedStudent._id,
                studentId: updatedStudent.studentId,
                firstName: updatedStudent.firstName,
                lastName: updatedStudent.lastName,
                email: updatedStudent.email,
                phone: updatedStudent.phone,
                linkedin: updatedStudent.linkedin,
                suspended: updatedStudent.suspended,
                createdAt: updatedStudent.createdAt,
                updatedAt: updatedStudent.updatedAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get all companies
 * @route   GET /api/admin/companies
 * @access  Private (Admin only)
 */
const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await Company.find({})
            .select("-password")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Companies retrieved successfully",
            data: companies,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get single company by ID
 * @route   GET /api/admin/companies/:id
 * @access  Private (Admin only)
 */
const getCompanyById = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id).select("-password");

        if (!company) {
            res.status(404);
            throw new Error("Company not found");
        }

        res.status(200).json({
            success: true,
            message: "Company retrieved successfully",
            data: company,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Delete a company account
 * @route   DELETE /api/admin/companies/:id
 * @access  Private (Admin only)
 */
const deleteCompany = async (req, res, next) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            res.status(404);
            throw new Error("Company not found");
        }

        await Company.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Company account deleted successfully",
            data: {
                _id: company._id,
                name: company.name,
                email: company.email,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeStudents = await Student.countDocuments({ suspended: false });
        const suspendedStudents = await Student.countDocuments({ suspended: true });
        
        const totalCompanies = await Company.countDocuments();
        const activeCompanies = await Company.countDocuments({ isActive: true });
        
        const recentStudents = await Student.find({})
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            message: "Dashboard statistics retrieved successfully",
            data: {
                totalStudents,
                activeStudents,
                suspendedStudents,
                totalCompanies,
                activeCompanies,
                recentStudents,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    suspendStudent,
    unsuspendStudent,
    deleteStudent,
    updateStudentByAdmin,
    getAllCompanies,
    getCompanyById,
    deleteCompany,
    getDashboardStats,
};
