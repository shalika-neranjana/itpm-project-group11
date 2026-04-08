const express = require("express");
const router = express.Router();
const { getMyNotifications, markNotificationAsRead } = require("../controllers/notificationController");
const { protectStudent } = require("../middleware/authMiddleware");

router.get("/my", protectStudent, getMyNotifications);
router.put("/:id/read", protectStudent, markNotificationAsRead);

module.exports = router;
