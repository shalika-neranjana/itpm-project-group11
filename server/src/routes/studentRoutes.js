/**
 * Student routes for profile management.
 */

const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
    getStudentProfile,
    updateStudentProfile,
    deleteStudentProfile,
    getStudentNotifications,
    markNotificationAsRead,
} = require("../controllers/studentController");

const router = express.Router();

router.get("/profile", protect, getStudentProfile);
router.put("/profile", protect, updateStudentProfile);
router.delete("/profile", protect, deleteStudentProfile);
router.get("/notifications", protect, getStudentNotifications);
router.put("/notifications/:id/read", protect, markNotificationAsRead);

module.exports = router;