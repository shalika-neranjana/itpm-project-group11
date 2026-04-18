const Notification = require("../models/Notification");

const getMyNotifications = async (req, res, next) => {
    try {
        const notifications = await Notification.find({ student: req.student._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: notifications,
        });
    } catch (error) {
        next(error);
    }
};

const markNotificationAsRead = async (req, res, next) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, student: req.student._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            res.status(404);
            throw new Error("Notification not found");
        }

        res.status(200).json({
            success: true,
            data: notification,
        });
    } catch (error) {
        next(error);
    }
};

const createNotification = async (studentId, message, type) => {
    try {
        const notification = await Notification.create({
            student: studentId,
            message,
            type,
        });

        return notification;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    createNotification,
};
