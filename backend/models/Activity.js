const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        type: {
            type: String,
            enum: [
                "career_viewed",
                "career_saved",
                "career_removed",
                "roadmap_started",
                "roadmap_completed",
                "profile_updated",
                "assessment_completed"
            ],
            required: true
        },

        career: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career"
        },

        description: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Activity", activitySchema);