const MonthlyReport = require("../../models/MyInternships/MonthlyReport");


// Add report
exports.addReport = async (req, res) => {
    try {

        const report = new MonthlyReport(req.body);

        const saved = await report.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get reports
exports.getReports = async (req, res) => {
    try {

        const reports = await MonthlyReport.find({
            internship: req.params.internshipId,
        });

        res.json(reports);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update report
exports.updateReport = async (req, res) => {
    try {

        const updated = await MonthlyReport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete report
exports.deleteReport = async (req, res) => {
    try {

        await MonthlyReport.findByIdAndDelete(
            req.params.id
        );

        res.json({ message: "Deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};