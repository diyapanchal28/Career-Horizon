const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const chatbotRateLimiter = require("../middleware/rateLimitMiddleware");
const {
    getInit,
    sendMessage,
    getConversations,
    getConversationMessages,
    createConversation,
    deleteConversation
} = require("../controllers/chatbotController");

// All chatbot routes require authentication
router.use(protect);

// Dynamic initialization data (welcome message + suggestions based on assessment)
router.get("/init", getInit);

// Send message & receive AI guidance (rate limited)
router.post("/message", chatbotRateLimiter({ max: 30, windowMs: 60000 }), sendMessage);

// Conversations management
router.get("/conversations", getConversations);
router.post("/conversations", chatbotRateLimiter({ max: 20, windowMs: 60000 }), createConversation);
router.get("/conversations/:conversationId", getConversationMessages);
router.delete("/conversations/:conversationId", deleteConversation);

module.exports = router;
