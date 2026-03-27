/**
 * Admin routes for student and company management.
 */

const express = require("express");
const {
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
} = require("../../controllers/Profiles/adminController");

const { adminAuth } = require("../../middleware/Profiles/adminMiddleware");
const protect = require("../../middleware/authMiddleware");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(adminAuth);

/**
 * @route   GET /api/admin/students
 * @desc    Get all students
 * @access  Private (Admin only)
 */
router.get("/students", getAllStudents);

/**
 * @route   GET /api/admin/students/:id
 * @desc    Get single student by ID
 * @access  Private (Admin only)
 */
router.get("/students/:id", getStudentById);

/**
 * @route   PUT /api/admin/students/:id/suspend
 * @desc    Suspend a student account
 * @access  Private (Admin only)
 */
router.put("/students/:id/suspend", suspendStudent);

/**
 * @route   PUT /api/admin/students/:id/unsuspend
 * @desc    Unsuspend a student account
 * @access  Private (Admin only)
 */
router.put("/students/:id/unsuspend", unsuspendStudent);

/**
 * @route   DELETE /api/admin/students/:id
 * @desc    Delete a student account
 * @access  Private (Admin only)
 */
router.delete("/students/:id", deleteStudent);

/**
 * @route   PUT /api/admin/students/:id
 * @desc    Update student profile (Admin version)
 * @access  Private (Admin only)
 */
router.put("/students/:id", updateStudentByAdmin);

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get("/stats", getDashboardStats);

/**
 * @route   GET /api/admin/companies
 * @desc    Get all companies
 * @access  Private (Admin only)
 */
router.get("/companies", getAllCompanies);

/**
 * @route   GET /api/admin/companies/:id
 * @desc    Get single company by ID
 * @access  Private (Admin only)
 */
router.get("/companies/:id", getCompanyById);

/**
 * @route   DELETE /api/admin/companies/:id
 * @desc    Delete a company account
 * @access  Private (Admin only)
 */
router.delete("/companies/:id", deleteCompany);

module.exports = router;
