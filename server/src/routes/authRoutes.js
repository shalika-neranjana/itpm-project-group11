/**
 * Authentication routes for student registration and login.
 */

const express = require("express");
const { registerStudent, loginStudent } = require("../controllers/authController");

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new student
 * @access  Public
 */
router.post("/register", registerStudent);

/**
 * @route   POST /api/auth/login
 * @desc    Login student
 * @access  Public
 */
router.post("/login", loginStudent);

module.exports = router;