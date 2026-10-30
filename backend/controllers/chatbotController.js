const ChatConversation = require("../models/ChatConversation");
const ChatMessage = require("../models/ChatMessage");
const { getInitialStateForUser, processUserMessage } = require("../services/chatbotService");

/**
 * Get personalized initialization data (Welcome message + Dynamic suggested questions)
 * GET /api/chatbot/init
 */
const getInit = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const initData = await getInitialStateForUser(userId);
        res.json(initData);
    } catch (error) {
        console.error("Chatbot init error:", error);
        res.status(500).json({
            message: "Failed to initialize chatbot data",
            error: error.message
        });
    }
};

/**
 * Send a message and get AI response
 * POST /api/chatbot/message
 */
const sendMessage = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { message, conversationId } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({ message: "Message content cannot be empty." });
        }

        const result = await processUserMessage({
            userId,
            conversationId,
            userMessage: message
        });

        res.json(result);
    } catch (error) {
        console.error("Chatbot sendMessage error:", error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            message: error.message || "Failed to process chat message",
            error: error.message
        });
    }
};

/**
 * Get all conversations for the authenticated user
 * GET /api/chatbot/conversations
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;

        const conversations = await ChatConversation.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        // Optionally attach last message snippet or count
        const conversationsWithMeta = await Promise.all(
            conversations.map(async (conv) => {
                const messageCount = await ChatMessage.countDocuments({ conversationId: conv._id });
                const lastMessage = await ChatMessage.findOne({ conversationId: conv._id })
                    .sort({ createdAt: -1 })
                    .select("content role createdAt")
                    .lean();

                return {
                    ...conv,
                    messageCount,
                    lastMessageSnippet: lastMessage ? lastMessage.content.slice(0, 60) : ""
                };
            })
        );

        res.json(conversationsWithMeta);
    } catch (error) {
        console.error("Chatbot getConversations error:", error);
        res.status(500).json({
            message: "Failed to fetch conversations",
            error: error.message
        });
    }
};

/**
 * Get messages for a specific conversation
 * GET /api/chatbot/conversations/:conversationId
 */
const getConversationMessages = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const conversation = await ChatConversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Server-side authorization check: Prevent users from viewing others' conversations
        if (conversation.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. You do not own this conversation." });
        }

        const messages = await ChatMessage.find({ conversationId })
            .sort({ createdAt: 1 })
            .lean();

        res.json({
            conversation,
            messages
        });
    } catch (error) {
        console.error("Chatbot getConversationMessages error:", error);
        res.status(500).json({
            message: "Failed to fetch messages for conversation",
            error: error.message
        });
    }
};

/**
 * Create a new conversation
 * POST /api/chatbot/conversations
 */
const createConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { title } = req.body;

        const conversation = await ChatConversation.create({
            userId,
            title: title ? title.trim().slice(0, 60) : "New Career Chat"
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error("Chatbot createConversation error:", error);
        res.status(500).json({
            message: "Failed to create conversation",
            error: error.message
        });
    }
};

/**
 * Delete a conversation and its messages
 * DELETE /api/chatbot/conversations/:conversationId
 */
const deleteConversation = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { conversationId } = req.params;

        const conversation = await ChatConversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Server-side authorization check: Prevent users from deleting others' conversations
        if (conversation.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied. You do not own this conversation." });
        }

        // Delete conversation & all associated messages
        await Promise.all([
            ChatConversation.findByIdAndDelete(conversationId),
            ChatMessage.deleteMany({ conversationId })
        ]);

        res.json({ message: "Conversation deleted successfully", conversationId });
    } catch (error) {
        console.error("Chatbot deleteConversation error:", error);
        res.status(500).json({
            message: "Failed to delete conversation",
            error: error.message
        });
    }
};

module.exports = {
    getInit,
    sendMessage,
    getConversations,
    getConversationMessages,
    createConversation,
    deleteConversation
};
