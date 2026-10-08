const mongoose = require("mongoose");

const savedCareerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        career: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true
        }
    },
    { timestamps: true }
);

// Prevent the same user from saving the same career twice
savedCareerSchema.index(
    { user: 1, career: 1 },
    { unique: true }
);

module.exports = mongoose.model(
    "SavedCareer",
    savedCareerSchema
);