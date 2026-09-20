const Activity = require("../models/Activity");


// Create an activity for the logged-in user
const createActivity = async (req, res) => {
    try {
        const {
            type,
            career,
            description
        } = req.body;

        const activity = await Activity.create({
            user: req.user.userId,
            type,
            career,
            description
        });

        const populatedActivity = await activity.populate(
            "career",
            "name"
        );

        res.status(201).json(populatedActivity);

    } catch (error) {
        res.status(500).json({
            message: "Failed to create activity",
            error: error.message
        });
    }
};


// Get activities for the logged-in user
const getUserActivities = async (req, res) => {
    try {
        const userId = req.user.userId;

        const activities = await Activity.find({
            user: userId
        })
            .populate("career", "name")
            .sort({ createdAt: -1 });

        res.json(activities);

    } catch (error) {
        res.status(500).json({
            message: "Failed to get activities",
            error: error.message
        });
    }
};


// Delete activities for the logged-in user
const deleteUserActivities = async (req, res) => {
    try {
        const userId = req.user.userId;

        await Activity.deleteMany({
            user: userId
        });

        res.json({
            message: "User activities deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to delete activities",
            error: error.message
        });
    }
};


module.exports = {
    createActivity,
    getUserActivities,
    deleteUserActivities
};