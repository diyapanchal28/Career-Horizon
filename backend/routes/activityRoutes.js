const express = require("express");

const {
    createActivity,
    getUserActivities,
    deleteUserActivities
} = require("../controllers/activityController");

const router = express.Router();


// Create activity
router.post("/", createActivity);


// Get activities for a user
router.get("/:userId", getUserActivities);


// Delete all activities for a user
router.delete("/:userId", deleteUserActivities);


module.exports = router;