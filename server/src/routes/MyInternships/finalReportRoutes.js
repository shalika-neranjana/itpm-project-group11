const express = require("express");
const router = express.Router();

const {
    addFinalReport,
    getFinalReport,
    getAllFinalReports,
    updateFinalReport,
    deleteFinalReport,
} = require("../../controllers/MyInternships/finalReportController");


// Add new final report
router.post("/", addFinalReport);


// Get all final reports
router.get("/", getAllFinalReports);


// Get final report by internship ID
router.get("/internship/:internshipId", getFinalReport);


// Update final report
router.put("/:id", updateFinalReport);


// Delete final report
router.delete("/:id", deleteFinalReport);


module.exports = router;