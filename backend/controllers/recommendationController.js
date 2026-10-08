const User = require("../models/User");
const Career = require("../models/Career");
const { rankCareersForUser, calculateCareerMatch } = require("../utils/recommendationEngine");

// Get all recommendations for the logged-in user
const getRecommendations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId)
            .populate("selectedFields", "name")
            .populate("selectedSubfields", "name");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const careers = await Career.find({ isActive: true })
            .populate("fieldId", "name")
            .populate("subfieldId", "name");

        const recommendations = rankCareersForUser(user, careers);

        res.json({
            count: recommendations.length,
            recommendations
        });
    } catch (error) {
        console.error("Recommendations error:", error);
        res.status(500).json({
            message: "Failed to calculate recommendations",
            error: error.message
        });
    }
};

// Get match score and reasons for a specific career for the logged-in user
const getCareerMatch = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { careerId } = req.params;

        const user = await User.findById(userId)
            .populate("selectedFields", "name")
            .populate("selectedSubfields", "name");

        const career = await Career.findById(careerId)
            .populate("fieldId", "name")
            .populate("subfieldId", "name");

        if (!career) {
            return res.status(404).json({ message: "Career not found" });
        }

        const match = calculateCareerMatch(user, career);

        res.json({
            careerId: career._id,
            careerName: career.name,
            matchPercentage: match.score,
            matchComponents: match.components,
            matchReasons: match.reasons
        });
    } catch (error) {
        console.error("Career match error:", error);
        res.status(500).json({
            message: "Failed to evaluate career match",
            error: error.message
        });
    }
};

module.exports = {
    getRecommendations,
    getCareerMatch
};
