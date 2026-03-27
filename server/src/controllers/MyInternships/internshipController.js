/**
 * Controller for Internship CRUD
 */
const StudentInternship = require("../../models/MyInternships/Internship");

// Add new internship
exports.addInternship = async (req, res) => {
    try {

        const newInternship = new StudentInternship(req.body);

        const savedInternship = await newInternship.save();

        res.status(201).json(savedInternship);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get all internships for student
exports.getInternships = async (req, res) => {
    try {
        const internships = await StudentInternship.find({
            studentIdNumber: req.params.studentId  
        })
        res.json(internships)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


// Get single internship
exports.getInternshipById = async (req, res) => {
    try {

        const internship = await StudentInternship.findById(
            req.params.id
        );

        res.json(internship);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update internship
exports.updateInternship = async (req, res) => {
    try {

        const updated = await StudentInternship.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete internship
exports.deleteInternship = async (req, res) => {
    try {

        await StudentInternship.findByIdAndDelete(
            req.params.id
        );

        res.json({ message: "Deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};