const express = require("express");
const protect = require("../../middleware/authMiddleware");
const {
    askInternConnect,
    getStudentGuidance,
    updateStudentInterests,
    updateStudentSkills,
} = require("../../controllers/student_guidance/studentGuidanceController");

const router = express.Router();

router.get("/", protect, getStudentGuidance);
router.put("/interests", protect, updateStudentInterests);
router.put("/skills", protect, updateStudentSkills);
router.post("/chat", protect, askInternConnect);

module.exports = router;
