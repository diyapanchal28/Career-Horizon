const mongoose = require("mongoose");

const roadmapStepSchema = new mongoose.Schema(
    {
        stepNumber: {
            type: Number,
            default: 1
        },
        order: {
            type: Number,
            default: 1
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            default: ""
        },
        whyItMatters: {
            type: String,
            default: ""
        },
        topics: {
            type: [String],
            default: []
        },
        practice: {
            type: String,
            default: ""
        },
        estimatedWeeks: {
            type: Number,
            default: 4
        }
    },
    { _id: true }
);

const roadmapSchema = new mongoose.Schema(
    {
        career: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career"
        },
        careerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career"
        },
        title: {
            type: String,
            default: ""
        },
        summary: {
            type: String,
            default: ""
        },
        steps: {
            type: [roadmapStepSchema],
            default: []
        }
    },
    {
        timestamps: true,
        strict: false
    }
);

// Virtual helper to normalize career reference
roadmapSchema.virtual("effectiveCareerId").get(function () {
    return this.careerId || this.career;
});

module.exports = mongoose.model("Roadmap", roadmapSchema);