const mongoose = require("mongoose");

const chatConversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        title: {
            type: String,
            default: "New Career Chat",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

chatConversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model("ChatConversation", chatConversationSchema);
