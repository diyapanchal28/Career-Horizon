const Activity = require("../models/Activity");


// Create an activity
const createActivity = async (req, res) => {
    try {
        const {
            user,
            type,
            career,
            description
        } = req.body;

        const activity = await Activity.create({
            user,
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


// Get activities for a user
const getUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;

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


// Delete all activities for a user
const deleteUserActivities = async (req, res) => {
    try {
        const { userId } = req.params;

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