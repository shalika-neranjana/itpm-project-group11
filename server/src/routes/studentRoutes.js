/**
 * Student routes for profile management.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
} = require("../controllers/studentController");

const router = express.Router();

router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);
router.delete("/profile", protect, deleteStudentProfile);

module.exports = router;