const express = require("express");

const {
    createActivity,
    getUserActivities,
    deleteUserActivities
} = require("../controllers/activityController");

const router = express.Router();

const protect = require("../middleware/authMiddleware");


// Create activity
router.post("/", protect, createActivity);


// Get logged-in user's activities
router.get("/", protect, getUserActivities);


// Delete logged-in user's activities
router.delete("/", protect, deleteUserActivities);


module.exports = router;