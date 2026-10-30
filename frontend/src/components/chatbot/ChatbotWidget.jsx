import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  Bot,
  Sparkles,
  X,
  Plus,
  History,
  Send,
  Trash2,
  ChevronLeft,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import ChatMessageContent from "./ChatMessageContent";
import {
  fetchChatbotInit,
  sendChatMessage,
  fetchChatConversations,
  fetchConversationMessages,
  createChatConversation,
  deleteChatConversation
} from "../../services/chatbotService";
import "./chatbot.css";

export default function ChatbotWidget() {
  const location = useLocation();
  const { isAuthenticated, token, user } = useAuth();

  // Widget visibility & panel state
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Active chat state
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Initialization & history state
  const [initData, setInitData] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Hide completely on Admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isProcessing, isOpen]);

  // Load initialization data (Welcome message + Dynamic suggestions)
  const loadInitData = async () => {
    try {
      const activeToken = token || localStorage.getItem("token");
      if (activeToken) {
        const data = await fetchChatbotInit(activeToken);
        setInitData(data);
      } else {
        // Fallback for non-authenticated visitors
        setInitData({
          welcomeMessage:
            "Hello! 👋 I'm your Career Horizon AI Assistant.\n\nI'm here to help you explore careers, understand roadmaps, and plan your career journey.\n\nSign in to unlock personalized career recommendations tailored to your assessment!",
          suggestedQuestions: [
            "Which career best matches my interests?",
            "What does a Software Developer do?",
            "What is the difference between UI/UX and graphic design?",
            "Can I pursue a tech career without coding?",
            "How can I prepare for an internship?",
            "What are high-demand careers in technology?"
          ],
          assessmentCompleted: false,
          topCareerName: null,
          topMatchPercentage: null
        });
      }
    } catch (err) {
      console.warn("Init data fetch error:", err.message);
    }
  };

  useEffect(() => {
    if (isOpen && !initData) {
      loadInitData();
    }
  }, [isOpen, isAuthenticated, token]);

  // Load conversation list
  const loadConversations = async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return;

    try {
      setLoadingHistory(true);
      const list = await fetchChatConversations(activeToken);
      setConversations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Open / Close History Drawer
  const toggleHistory = () => {
    if (!showHistory) {
      loadConversations();
    }
    setShowHistory((prev) => !prev);
  };

  // Start a fresh conversation
  const handleStartNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setShowHistory(false);
    setErrorMsg(null);
  };

  // Select an existing conversation from history
  const handleSelectConversation = async (convId) => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return;

    try {
      setIsProcessing(true);
      setErrorMsg(null);
      const data = await fetchConversationMessages(convId, activeToken);
      setActiveConversationId(convId);
      setMessages(data.messages || []);
      setShowHistory(false);
    } catch (err) {
      setErrorMsg("Failed to open conversation. " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a conversation from history
  const handleDeleteConversation = async (e, convId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return;

    try {
      await deleteChatConversation(convId, activeToken);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (activeConversationId === convId) {
        handleStartNewConversation();
      }
    } catch (err) {
      alert("Failed to delete conversation: " + err.message);
    }
  };

  // Send a message
  const handleSendMessage = async (textToSend) => {
    const content = (textToSend || inputText).trim();
    if (!content || isProcessing) return;

    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) {
      setErrorMsg("Please log in to chat with your Career Horizon Assistant and save your discussions.");
      return;
    }

    setErrorMsg(null);
    setInputText("");

    // Optimistically add user message to chat UI
    const optimisticUserMsg = {
      _id: `temp-${Date.now()}`,
      role: "user",
      content,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setIsProcessing(true);

    try {
      const response = await sendChatMessage(
        {
          message: content,
          conversationId: activeConversationId
        },
        activeToken
      );

      // Save active conversation id
      if (response.conversationId) {
        setActiveConversationId(response.conversationId);
      }

      // Add assistant response
      if (response.message) {
        setMessages((prev) => [...prev, response.message]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setErrorMsg(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Enter / Shift+Enter key in textarea
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp nicely
  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ch-chatbot-btn"
          aria-label="Open Career Horizon AI Assistant"
          title="Career Horizon AI – Your Personal Career Assistant"
        >
          <div className="ch-btn-icon-wrapper">
            <Bot size={22} />
            <span className="ch-online-badge" />
          </div>
          <span className="ch-btn-label">Career AI</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="ch-chat-window" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="ch-chat-header">
            <div className="ch-header-brand">
              <div className="ch-avatar-circle">
                <Bot size={22} />
                <span className="ch-online-badge" />
              </div>
              <div className="ch-header-title-box">
                <span className="ch-header-title">Career Horizon AI</span>
                <span className="ch-header-subtitle">Your Personal Career Assistant</span>
              </div>
            </div>

            <div className="ch-header-actions">
              {/* History Toggle Button */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={toggleHistory}
                  className="ch-icon-btn"
                  title="Conversation History"
                  aria-label="Conversation History"
                >
                  <History size={18} />
                  {conversations.length > 0 && <span className="ch-badge-dot" />}
                </button>
              )}

              {/* New Chat Button */}
              <button
                type="button"
                onClick={handleStartNewConversation}
                className="ch-icon-btn"
                title="Start New Conversation"
                aria-label="Start New Conversation"
              >
                <Plus size={18} />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ch-icon-btn"
                title="Close Chat"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* History Drawer Overlay */}
          {showHistory && (
            <div className="ch-history-drawer">
              <div className="ch-history-header">
                <h4>Previous Conversations</h4>
                <button
                  type="button"
                  onClick={handleStartNewConversation}
                  className="ch-new-chat-btn-sm"
                >
                  <Plus size={14} /> New Chat
                </button>
              </div>

              <div className="ch-history-list">
                {loadingHistory ? (
                  <div className="ch-history-empty">Loading history...</div>
                ) : conversations.length === 0 ? (
                  <div className="ch-history-empty">
                    <MessageSquare size={28} />
                    <span>No previous conversations yet</span>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv._id)}
                      className={`ch-history-item ${activeConversationId === conv._id ? "active" : ""}`}
                    >
                      <div className="ch-history-info">
                        <div className="ch-history-title">{conv.title || "Career Chat"}</div>
                        <div className="ch-history-time">
                          {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric"
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(e, conv._id)}
                        className="ch-history-delete-btn"
                        title="Delete Conversation"
                        aria-label="Delete Conversation"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div className="ch-messages-container">
            {/* Initial Welcome Message if conversation is clean */}
            {messages.length === 0 && initData && (
              <div className="ch-message-row assistant">
                <div className="ch-bot-avatar-mini">
                  <Bot size={16} />
                </div>
                <div className="ch-bubble-wrapper">
                  <div className="ch-bubble assistant">
                    <ChatMessageContent content={initData.welcomeMessage} />
                  </div>
                </div>
              </div>
            )}

            {/* Message History */}
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg._id || Math.random()} className={`ch-message-row ${isUser ? "user" : "assistant"}`}>
                  {!isUser && (
                    <div className="ch-bot-avatar-mini">
                      <Bot size={16} />
                    </div>
                  )}
                  <div className="ch-bubble-wrapper">
                    <div className={`ch-bubble ${isUser ? "user" : "assistant"}`}>
                      <ChatMessageContent content={msg.content} />
                    </div>
                    {msg.createdAt && (
                      <span className="ch-message-time">{formatTime(msg.createdAt)}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isProcessing && (
              <div className="ch-message-row assistant">
                <div className="ch-bot-avatar-mini">
                  <Bot size={16} />
                </div>
                <div className="ch-typing-bubble">
                  <div className="ch-dots">
                    <span className="ch-dot" />
                    <span className="ch-dot" />
                    <span className="ch-dot" />
                  </div>
                  <span className="ch-typing-label">Career Horizon AI is thinking...</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMsg && (
              <div className="ch-error-banner">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  style={{ background: "transparent", border: "none", color: "inherit", cursor: "pointer" }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Dynamic Suggested Questions Pills */}
            {messages.length === 0 && initData?.suggestedQuestions?.length > 0 && (
              <div className="ch-suggestions-box">
                <span className="ch-suggestions-title">Suggested questions:</span>
                <div className="ch-suggestions-grid">
                  {initData.suggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(q)}
                      className="ch-suggestion-chip"
                      disabled={isProcessing}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="ch-chat-input-area">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="ch-input-form"
            >
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your career..."
                className="ch-chat-textarea"
                rows={1}
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isProcessing}
                className="ch-send-btn"
                title="Send Message (Enter)"
                aria-label="Send Message"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
