const Notification = require("../models/Notification");
const User = require("../models/User");
const { sendNotificationEmail } = require("../utils/emailService");

// Create a notification for a user (logged-in user or specified userId)
const createNotification = async (req, res) => {
    try {
        const {
            title,
            message,
            type,
            userId
        } = req.body;

        const targetUserId = userId || req.user.userId;

        const notification = await Notification.create({
            user: targetUserId,
            title,
            message,
            type: type || "general"
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
                returnDocument: 'after',
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
            message: "Failed to delete notification",
            error: error.message
        });
    }
};

// Mark all notifications as read for logged-in user
const markAllNotificationsAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.userId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update notifications",
            error: error.message
        });
    }
};

// Test email notification endpoint for the authenticated user
const testEmailNotification = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.email) {
            return res.status(404).json({ message: "User or user email not found" });
        }

        const result = await sendNotificationEmail({
            to: user.email,
            name: user.name,
            title: "Test Notification from Career Horizon",
            message: "Your email notifications are working! You will receive future milestone and career guidance updates directly to this email address.",
            type: "general"
        });

        if (result.notConfigured) {
            return res.status(200).json({
                message: "Email service is configured in code, but EMAIL_USER/EMAIL_PASS have not been filled in backend/.env yet.",
                configured: false,
                recipient: user.email
            });
        }

        if (!result.success) {
            return res.status(500).json({
                message: "Failed to send email. Check SMTP credentials or network settings.",
                configured: true,
                error: result.error
            });
        }

        res.json({
            message: `Test email notification successfully sent to ${user.email}`,
            configured: true,
            messageId: result.messageId
        });
    } catch (error) {
        res.status(500).json({
            message: "Test email failed",
            error: error.message
        });
    }
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    testEmailNotification
};
