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
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SavedCareer", savedCareerSchema);