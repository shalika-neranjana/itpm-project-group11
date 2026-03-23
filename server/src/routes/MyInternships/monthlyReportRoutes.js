const express = require("express");
const router = express.Router();

const {
    addReport,
    getReports,
    updateReport,
    deleteReport,
} = require("../../controllers/MyInternships/monthlyReportController");
const MonthlyReport = require("../../models/MyInternships/MonthlyReport");


router.post("/", addReport);

// Get all monthly reports
router.get("/", async (req, res) => {
    try {
        const reports = await MonthlyReport.find();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/internship/:internshipId", getReports);

router.put("/:id", updateReport);

router.delete("/:id", deleteReport);


module.exports = router;