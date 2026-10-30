import { API_URL as BASE_API_URL } from "../config/api";

const API_URL = `${BASE_API_URL}/chatbot`;

const getAuthHeaders = (token) => {
  const activeToken = token || localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {})
  };
};

/**
 * Fetch personalized initial greeting and dynamic suggestions
 */
export const fetchChatbotInit = async (token) => {
  const res = await fetch(`${API_URL}/init`, {
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error(`Failed to initialize chatbot (Status ${res.status})`);
  }

  return await res.json();
};

/**
 * Send a message to the AI chatbot
 */
export const sendChatMessage = async ({ message, conversationId }, token) => {
  const res = await fetch(`${API_URL}/message`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ message, conversationId })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Failed to send message (Status ${res.status})`);
  }

  return data;
};

/**
 * Fetch past conversations for the authenticated user
 */
export const fetchChatConversations = async (token) => {
  const res = await fetch(`${API_URL}/conversations`, {
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error(`Failed to load chat history (Status ${res.status})`);
  }

  return await res.json();
};

/**
 * Fetch all messages for a specific conversation
 */
export const fetchConversationMessages = async (conversationId, token) => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error(`Failed to load conversation (Status ${res.status})`);
  }

  return await res.json();
};

/**
 * Create a new conversation
 */
export const createChatConversation = async (title, token) => {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify({ title })
  });

  if (!res.ok) {
    throw new Error(`Failed to create conversation (Status ${res.status})`);
  }

  return await res.json();
};

/**
 * Delete a conversation
 */
export const deleteChatConversation = async (conversationId, token) => {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token)
  });

  if (!res.ok) {
    throw new Error(`Failed to delete conversation (Status ${res.status})`);
  }

  return await res.json();
};
