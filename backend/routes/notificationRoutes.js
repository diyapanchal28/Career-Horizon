const express = require("express");

const {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} = require("../controllers/notificationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create notification
router.post("/", protect, createNotification);


// Get logged-in user's notifications
router.get("/", protect, getUserNotifications);

// Mark all as read
router.put("/read-all", protect, markAllNotificationsAsRead);

// Mark notification as read
router.put("/:id/read", protect, markNotificationAsRead);


// Delete notification
router.delete("/:id", protect, deleteNotification);


module.exports = router;