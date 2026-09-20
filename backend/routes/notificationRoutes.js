const express = require("express");

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const router = express.Router();


// Create notification
router.post("/", createNotification);


// Get user notifications
router.get("/:userId", getUserNotifications);


// Mark notification as read
router.put("/:id/read", markNotificationAsRead);


// Delete notification
router.delete("/:id", deleteNotification);


module.exports = router;