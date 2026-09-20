const Notification = require("../models/Notification");


// Create a notification
const createNotification = async (req, res) => {
    try {
        const {
            user,
            title,
            message,
            type
        } = req.body;

        const notification = await Notification.create({
            user,
            title,
            message,
            type
        });

        res.status(201).json(notification);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create notification",
            error: error.message
        });
    }
};


// Get notifications for a user
const getUserNotifications = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({
            user: userId
        }).sort({ createdAt: -1 });

        res.json(notifications);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get notifications",
            error: error.message
        });
    }
};


// Mark notification as read
const markNotificationAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            {
                new: true,
                runValidators: true
            }
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json(notification);

    } catch (error) {
        res.status(500).json({
            message: "Failed to update notification",
            error: error.message
        });
    }
};


// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndDelete(
            req.params.id
        );

        if (!notification) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete notification",
            error: error.message
        });
    }
};


module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
};