const mongoose = require("mongoose");

const roadmapProgressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        careerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true
        },

        roadmapId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Roadmap",
            required: true
        },

        completedStepIds: [
            {
                type: mongoose.Schema.Types.ObjectId
            }
        ],

        startedAt: {
            type: Date,
            default: Date.now
        },

        lastActivityAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

roadmapProgressSchema.index({ userId: 1, careerId: 1 }, { unique: true });

module.exports = mongoose.model("RoadmapProgress", roadmapProgressSchema);
