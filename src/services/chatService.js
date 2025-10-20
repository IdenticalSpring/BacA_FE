// src/services/chatService.js
import axios from "axios";
import { io } from "socket.io-client";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;

let socket = null;

// === Helper: Auth header for REST ===
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// === Socket control ===
const chatService = {
  // ----- SOCKET CORE -----
  connect: () => {
    if (socket) return socket;
    const token = localStorage.getItem("token");
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return socket;
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  on: (event, callback) => {
    if (!socket) return;
    socket.on(event, callback);
  },

  off: (event, callback) => {
    if (!socket) return;
    socket.off(event, callback);
  },

  // ============================================================
  // 🟢 PRIVATE CHAT SOCKET EVENTS
  // ============================================================
  joinPrivateChat: (classId, studentId) => {
    if (!socket) return;
    socket.emit("joinPrivateChat", { classId, studentId });
  },

  sendPrivateChat: (payload) => {
    if (!socket) return;
    socket.emit("sendPrivateChat", payload);
  },

  revokePrivateChat: (chatId, classId, studentId) => {
    if (!socket) return;
    socket.emit("revokePrivateChat", { chatId, classId, studentId });
  },

  markPrivateRead: (classId, studentId, readerRole) => {
    if (!socket) return;
    socket.emit("markPrivateRead", { classId, studentId, readerRole });
  },

  // ============================================================
  // 🟣 GROUP CHAT SOCKET EVENTS
  // ============================================================
  joinGroupRoom: (classId) => {
    if (!socket) return;
    socket.emit("joinRoom", { classId });
  },

  sendGroupMessage: (messageData) => {
    if (!socket) return;
    socket.emit("sendMessage", messageData); // expects { classId, content?, imageUrl?, audioUrl? }
  },

  recallGroupMessage: (messageId, classId) => {
    if (!socket) return;
    socket.emit("recallMessage", { messageId, classId });
  },

  subscribeGroupMessages: (onNew, onRecalled) => {
    if (!socket) return;
    if (onNew) socket.on("newMessage", onNew);
    if (onRecalled) socket.on("messageRecalled", onRecalled);
  },

  unsubscribeGroupMessages: (onNew, onRecalled) => {
    if (!socket) return;
    if (onNew) socket.off("newMessage", onNew);
    if (onRecalled) socket.off("messageRecalled", onRecalled);
  },

  // ============================================================
  // 🔵 REST METHODS (Private Chat)
  // ============================================================
  async getChatsByClass(classId) {
    const res = await axios.get(`${API_BASE}/chat/${classId}`, {
      headers: { ...authHeader() },
    });
    return res.data;
  },

  async createChat(payload) {
    // optional REST fallback
    const res = await axios.post(`${API_BASE}/chat`, payload, {
      headers: { "Content-Type": "application/json", ...authHeader() },
    });
    return res.data;
  },

  async revokeChat(chatId, isRevoked = true) {
    const res = await axios.patch(
      `${API_BASE}/chat/revoke/${chatId}`,
      { isRevoked },
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
      }
    );
    return res.data;
  },

  async markMessagesAsRead(classId, readerId, readerRole) {
    const res = await axios.post(
      `${API_BASE}/chat/read-messages`,
      { classId, readerId, readerRole },
      {
        headers: { "Content-Type": "application/json", ...authHeader() },
      }
    );
    return res.data;
  },
};

export default chatService;
