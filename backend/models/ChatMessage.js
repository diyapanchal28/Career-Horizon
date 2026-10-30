const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
    {
        conversationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatConversation",
            required: true,
            index: true
        },
        role: {
            type: String,
            enum: ["user", "assistant", "system"],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
