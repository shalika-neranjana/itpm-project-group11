/**
 * Company authentication routes
 */

const express = require("express");
const {
    registerCompany,
    loginCompany,
    getCompanyProfile,
    updateCompanyProfile,
} = require("../controllers/companyController");
const { uploadCompanyLogo } = require("../middleware/uploadMiddleware");

const companyAuth = require("../middleware/companyMiddleware");

const router = express.Router();

/**
 * @desc    Register a new company
 * @route   POST /api/company/register
 * @access  Public
 */
router.post("/register", uploadCompanyLogo, registerCompany);

/**
 * @desc    Login company
 * @route   POST /api/company/login
 * @access  Public
 */
router.post("/login", loginCompany);

/**
 * @desc    Get company profile
 * @route   GET /api/company/profile
 * @access  Private
 */
router.get("/profile", companyAuth, getCompanyProfile);

/**
 * @desc    Update company profile
 * @route   PUT /api/company/profile
 * @access  Private
 */
router.put("/profile", companyAuth, updateCompanyProfile);

module.exports = router;
