const express = require("express");
const router = express.Router();
const journeyController = require("../../controllers/student_guidance/journeyController");
const protect = require("../../middleware/authMiddleware");

// All routes are protected
router.use(protect);

router.get("/", journeyController.getAllJourneys);
router.get("/:id", journeyController.getJourneyById);
router.post("/", journeyController.createJourney);
router.put("/:id", journeyController.updateJourney);
router.delete("/:id", journeyController.deleteJourney);

router.post("/generate-ai", journeyController.generateAISteps);
router.post("/toggle-completion", journeyController.toggleStepCompletion);

module.exports = router;
