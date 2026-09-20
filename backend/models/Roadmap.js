const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
    {
        career: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Career",
            required: true
        },

        steps: [
            {
                title: {
                    type: String,
                    required: true
                },

                description: {
                    type: String,
                    default: ""
                },

                order: {
                    type: Number,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);