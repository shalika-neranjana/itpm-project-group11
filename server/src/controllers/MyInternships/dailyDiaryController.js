const DailyDiary = require("../../models/MyInternships/DailyDiary");


// Add entry
exports.addEntry = async (req, res) => {
    try {

        const entry = new DailyDiary(req.body);

        const saved = await entry.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get entries by internship
exports.getEntries = async (req, res) => {
    try {

        const entries = await DailyDiary.find({
            internship: req.params.internshipId,
        });

        res.json(entries);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update entry
exports.updateEntry = async (req, res) => {
    try {

        const updated = await DailyDiary.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete entry
exports.deleteEntry = async (req, res) => {
    try {

        await DailyDiary.findByIdAndDelete(
            req.params.id
        );

        res.json({ message: "Deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};