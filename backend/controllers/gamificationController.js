const {
    getGamificationOverview,
    recordLearningActivity,
    getOrCreateGamification,
    DEFAULT_WEEKLY_GOALS
} = require("../services/gamificationService");
const GamificationLog = require("../models/GamificationLog");

// Get full gamification overview for dashboard & achievements
const getOverview = async (req, res) => {
    try {
        const userId = req.user.userId;
        const overview = await getGamificationOverview(userId);
        res.json(overview);
    } catch (error) {
        console.error("Get gamification overview error:", error);
        res.status(500).json({
            message: "Failed to load achievements and gamification data",
            error: error.message
        });
    }
};

// Get all badges
const getBadges = async (req, res) => {
    try {
        const userId = req.user.userId;
        const record = await getOrCreateGamification(userId);
        res.json({
            badges: record.badges || [],
            totalCount: (record.badges || []).length,
            unlockedCount: (record.badges || []).filter((b) => b.unlocked).length
        });
    } catch (error) {
        console.error("Get badges error:", error);
        res.status(500).json({
            message: "Failed to load achievement badges",
            error: error.message
        });
    }
};

// Get weekly goals & previous performance history
const getWeeklyGoals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const record = await getOrCreateGamification(userId);
        const goals = record.weeklyGoals || [];
        const total = goals.length;
        const completed = goals.filter((g) => g.completed).length;

        res.json({
            weekStartDate: record.currentWeekStartDate,
            weekEndDate: record.currentWeekEndDate,
            goals,
            totalGoals: total,
            completedGoals: completed,
            progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            history: record.goalHistory || [],
            availableTemplates: DEFAULT_WEEKLY_GOALS
        });
    } catch (error) {
        console.error("Get weekly goals error:", error);
        res.status(500).json({
            message: "Failed to load weekly goals",
            error: error.message
        });
    }
};

// Select / customize active goals for the week
const setWeeklyGoals = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { selectedGoalIds } = req.body;

        if (!Array.isArray(selectedGoalIds) || selectedGoalIds.length === 0) {
            return res.status(400).json({
                message: "Please select at least one weekly goal."
            });
        }

        const record = await getOrCreateGamification(userId);

        // Filter and update goals
        const existingMap = new Map();
        (record.weeklyGoals || []).forEach((g) => {
            existingMap.set(g.goalId, g);
        });

        const newGoals = [];
        DEFAULT_WEEKLY_GOALS.forEach((template) => {
            if (selectedGoalIds.includes(template.goalId)) {
                const existing = existingMap.get(template.goalId);
                newGoals.push(
                    existing || {
                        ...template,
                        current: 0,
                        completed: false,
                        completedAt: null,
                        xpClaimed: false
                    }
                );
            }
        });

        record.weeklyGoals = newGoals;
        await record.save();

        res.json({
            message: "Weekly goals updated successfully",
            weeklyGoals: record.weeklyGoals
        });
    } catch (error) {
        console.error("Set weekly goals error:", error);
        res.status(500).json({
            message: "Failed to update weekly goals",
            error: error.message
        });
    }
};

// Record a meaningful learning activity (e.g. mock interview, skill practice)
const logActivity = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { activityType, title, notes } = req.body;

        const validTypes = ["mock_interview", "skill_learned", "learning_activity"];
        if (!validTypes.includes(activityType)) {
            return res.status(400).json({
                message: "Invalid activity type. Allowed: mock_interview, skill_learned, learning_activity"
            });
        }

        const result = await recordLearningActivity(userId, activityType, title, notes);
        res.json(result);
    } catch (error) {
        console.error("Log activity error:", error);
        res.status(500).json({
            message: "Failed to record learning activity",
            error: error.message
        });
    }
};

// Get user's achievement/XP history
const getActivityHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const logs = await GamificationLog.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(logs);
    } catch (error) {
        console.error("Get activity history error:", error);
        res.status(500).json({
            message: "Failed to load activity history",
            error: error.message
        });
    }
};

module.exports = {
    getOverview,
    getBadges,
    getWeeklyGoals,
    setWeeklyGoals,
    logActivity,
    getActivityHistory
};
