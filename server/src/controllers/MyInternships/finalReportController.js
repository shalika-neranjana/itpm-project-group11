const FinalReport = require("../../models/MyInternships/FinalReport");


// Add / save draft
exports.addFinalReport = async (req, res) => {
    try {

        const report = new FinalReport(req.body);

        const saved = await report.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get final report by internship ID
exports.getFinalReport = async (req, res) => {
    try {

        const report = await FinalReport.findOne({
            internship: req.params.internshipId,
        });

        res.json(report);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all final reports
exports.getAllFinalReports = async (req, res) => {
    try {

        const reports = await FinalReport.find();

        res.json(reports);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update final report
exports.updateFinalReport = async (req, res) => {
    try {

        const updated = await FinalReport.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete final report
exports.deleteFinalReport = async (req, res) => {
    try {

        await FinalReport.findByIdAndDelete(req.params.id);

        res.json({ message: "Final report deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};