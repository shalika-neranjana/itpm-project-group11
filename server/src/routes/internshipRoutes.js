/**
 * Internship routes
 */

const express = require("express");
const {
    getAllInternships,
    getInternshipById,
    createInternship,
    updateInternship,
    deleteInternship,
    getCompanyInternships,
    applyForInternship,
    getStudentApplications,
    updateApplicationStatus,
} = require("../controllers/internshipController");

const protect = require("../middleware/authMiddleware");
const companyAuth = require("../middleware/companyMiddleware");
const { uploadResumePdf } = require("../middleware/uploadMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllInternships);
router.get("/:id", getInternshipById);

// Protected routes for students
router.post("/:id/apply", protect, uploadResumePdf, applyForInternship);
router.get("/applications/my", protect, getStudentApplications);

// Protected routes for companies
router.post("/", companyAuth, createInternship);
router.put("/:id", companyAuth, updateInternship);
router.delete("/:id", companyAuth, deleteInternship);
router.get("/company/my", companyAuth, getCompanyInternships);
router.put("/:id/applications/:appId", companyAuth, updateApplicationStatus);

module.exports = router;
