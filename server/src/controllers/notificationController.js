const Notification = require("../models/Notification");
const Student = require("../models/Student");
const { sendWhatsAppMessage } = require("../utils/whatsappUtils");

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

const createNotificationWithWhatsApp = async (studentId, message, type) => {
    try {
        // Create the notification
        const notification = await Notification.create({
            student: studentId,
            message,
            type,
        });

        // Get student phone number
        const student = await Student.findById(studentId);
        if (student && student.phone && student.phone.trim()) {
            try {
                await sendWhatsAppMessage(student.phone, message);
            } catch (whatsappError) {
                console.error('Failed to send WhatsApp message:', whatsappError);
                // Don't fail if WhatsApp fails
            }
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

module.exports = {
    getMyNotifications,
    markNotificationAsRead,
    createNotificationWithWhatsApp,
};
