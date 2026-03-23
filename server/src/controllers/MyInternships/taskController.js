const Task = require("../../models/MyInternships/Task");


// Add task
exports.addTask = async (req, res) => {
    try {

        const task = new Task(req.body);

        const saved = await task.save();

        res.status(201).json(saved);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Get tasks
exports.getTasks = async (req, res) => {
    try {

        const tasks = await Task.find({
            internship: req.params.internshipId,
        });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update task
exports.updateTask = async (req, res) => {
    try {

        const updated = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updated);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Delete task
exports.deleteTask = async (req, res) => {
    try {

        await Task.findByIdAndDelete(
            req.params.id
        );

        res.json({ message: "Deleted" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};