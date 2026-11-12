const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
    {
        badgeId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        condition: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["roadmap", "streak", "goals", "skills", "interviews"],
            default: "roadmap"
        },
        unlocked: {
            type: Boolean,
            default: false
        },
        unlockedAt: {
            type: Date,
            default: null
        },
        currentProgress: {
            type: Number,
            default: 0
        },
        targetProgress: {
            type: Number,
            default: 1
        }
    },
    { _id: false }
);

const milestoneRewardSchema = new mongoose.Schema(
    {
        milestoneKey: {
            type: String, // e.g. "<careerId>_10", "<careerId>_50"
            required: true
        },
        careerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true
        },
        careerName: {
            type: String,
            default: ""
        },
        milestonePercent: {
            type: Number,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        xpAwarded: {
            type: Number,
            default: 100
        },
        unlockedAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const weeklyGoalSchema = new mongoose.Schema(
    {
        goalId: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: [
                "roadmap_tasks",
                "learn_skills",
                "learning_activities",
                "mock_interviews",
                "study_hours"
            ],
            required: true
        },
        target: {
            type: Number,
            required: true
        },
        current: {
            type: Number,
            default: 0
        },
        completed: {
            type: Boolean,
            default: false
        },
        completedAt: {
            type: Date,
            default: null
        },
        xpReward: {
            type: Number,
            default: 50
        },
        xpClaimed: {
            type: Boolean,
            default: false
        }
    },
    { _id: false }
);

const weeklyGoalHistorySchema = new mongoose.Schema(
    {
        weekStartDate: {
            type: String, // "YYYY-MM-DD"
            required: true
        },
        weekEndDate: {
            type: String, // "YYYY-MM-DD"
            required: true
        },
        totalGoals: {
            type: Number,
            default: 0
        },
        completedGoals: {
            type: Number,
            default: 0
        },
        completionPercentage: {
            type: Number,
            default: 0
        },
        xpEarned: {
            type: Number,
            default: 0
        }
    },
    { _id: false }
);

const gamificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        // XP & Level
        totalXp: {
            type: Number,
            default: 0,
            min: 0
        },
        currentLevel: {
            type: Number,
            default: 1,
            min: 1,
            max: 6
        },
        levelName: {
            type: String,
            default: "Beginner"
        },

        // Daily Learning Streaks
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastActiveDate: {
            type: String, // "YYYY-MM-DD"
            default: null
        },
        activityDates: {
            type: [String], // Array of unique "YYYY-MM-DD"
            default: []
        },

        // Badges Collection
        badges: {
            type: [badgeSchema],
            default: []
        },

        // Milestone Completion Rewards
        milestoneRewards: {
            type: [milestoneRewardSchema],
            default: []
        },

        // Current Week Goals
        currentWeekStartDate: {
            type: String, // "YYYY-MM-DD"
            default: ""
        },
        currentWeekEndDate: {
            type: String, // "YYYY-MM-DD"
            default: ""
        },
        weeklyGoals: {
            type: [weeklyGoalSchema],
            default: []
        },

        // Historical performance of previous weeks
        goalHistory: {
            type: [weeklyGoalHistorySchema],
            default: []
        },

        // Aggregated Counters for Badge Checks
        totalRoadmapTasksCompleted: {
            type: Number,
            default: 0
        },
        totalLearningActivities: {
            type: Number,
            default: 0
        },
        totalMockInterviews: {
            type: Number,
            default: 0
        },
        totalCompletedGoals: {
            type: Number,
            default: 0
        },
        totalCompletedRoadmaps: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Gamification", gamificationSchema);
