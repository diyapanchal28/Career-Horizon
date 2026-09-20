const Notification = require("../models/Notification");

// Create a notification for the logged-in user
const createNotification = async (req, res) => {
    try {
        const {
            title,
            message,
            type
        } = req.body;

        const notification = await Notification.create({
            user: req.user.userId,
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


// Get notifications for the logged-in user
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

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
        const notification = await Notification.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.userId
            },
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
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

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
            message: "Notification deleted successfully"
        });
    }
};


module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
};