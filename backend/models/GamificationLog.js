const mongoose = require("mongoose");

const gamificationLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        actionType: {
            type: String,
            enum: [
                "roadmap_task",
                "learning_activity",
                "mock_interview",
                "skill_learned",
                "weekly_goal",
                "milestone_reward",
                "streak_bonus"
            ],
            required: true
        },
        uniqueKey: {
            type: String,
            index: true // e.g. "task_<stepId>", "milestone_<careerId>_<pct>", "goal_<weekStart>_<goalId>"
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        xpEarned: {
            type: Number,
            required: true
        },
        date: {
            type: String, // "YYYY-MM-DD"
            required: true
        }
    },
    {
        timestamps: true
    }
);

// Compound index to guarantee uniqueness for idempotent rewards
gamificationLogSchema.index({ userId: 1, uniqueKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("GamificationLog", gamificationLogSchema);
