const express = require("express");
const protect = require("../../middleware/authMiddleware");
const {
    getStudentGuidance,
    updateStudentInterests,
    updateStudentSkills,
} = require("../../controllers/student_guidance/studentGuidanceController");

const router = express.Router();

router.get("/", protect, getStudentGuidance);
router.put("/interests", protect, updateStudentInterests);
router.put("/skills", protect, updateStudentSkills);

module.exports = router;
