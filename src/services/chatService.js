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
    if (socket) {
      console.log("⚠️ Socket already connected.");
      return socket;
    }

    const token = localStorage.getItem("token");
    console.log("🚀 Connecting to WebSocket:", SOCKET_URL);
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      forceNew: true,
      extraHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // --- Debug logs for socket lifecycle ---
    socket.on("connect", () => {
      console.log("✅ [SOCKET] Connected → ID:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ [SOCKET] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.warn("⚠️ [SOCKET] Disconnected:", reason);
    });

    socket.on("reconnect_attempt", (attempt) => {
      console.log("🔄 [SOCKET] Reconnect attempt:", attempt);
    });

    socket.on("reconnect", (attempt) => {
      console.log("✅ [SOCKET] Successfully reconnected on attempt:", attempt);
    });

    return socket;
  },

  disconnect: () => {
    if (socket) {
      console.log("🧹 [SOCKET] Disconnecting...");
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  on: (event, callback) => {
    if (!socket) return;
    console.log(`🎧 [SOCKET] Listening for event: "${event}"`);
    socket.on(event, callback);
  },

  off: (event, callback) => {
    if (!socket) return;
    console.log(`🔇 [SOCKET] Removing listener for event: "${event}"`);
    socket.off(event, callback);
  },

  // ============================================================
  // 🟢 PRIVATE CHAT SOCKET EVENTS
  // ============================================================
  joinPrivateChat: (classId, studentId) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log(`📡 [SOCKET] joinPrivateChat → classId=${classId}, studentId=${studentId}`);
    socket.emit("joinPrivateChat", { classId, studentId });
  },

  sendPrivateChat: (payload) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log("💬 [SOCKET] sendPrivateChat → payload:", payload);
    socket.emit("sendPrivateChat", payload);
  },

  revokePrivateChat: (chatId, classId, studentId) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log(
      `🗑️ [SOCKET] revokePrivateChat → chatId=${chatId}, classId=${classId}, studentId=${studentId}`
    );
    socket.emit("revokePrivateChat", { chatId, classId, studentId });
  },

  markPrivateRead: (classId, studentId, readerRole) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log(
      `📖 [SOCKET] markPrivateRead → classId=${classId}, studentId=${studentId}, role=${readerRole}`
    );
    socket.emit("markPrivateRead", { classId, studentId, readerRole });
  },

  // ============================================================
  // 🟣 GROUP CHAT SOCKET EVENTS
  // ============================================================
  joinGroupRoom: (classId) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log(`👥 [SOCKET] joinGroupRoom → classId=${classId}`);
    socket.emit("joinRoom", { classId });
  },

  sendGroupMessage: (messageData) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log("🗨️ [SOCKET] sendGroupMessage → data:", messageData);
    socket.emit("sendMessage", messageData);
  },

  recallGroupMessage: (messageId, classId) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    console.log(`♻️ [SOCKET] recallGroupMessage → messageId=${messageId}, classId=${classId}`);
    socket.emit("recallMessage", { messageId, classId });
  },

  subscribeGroupMessages: (onNew, onRecalled) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    if (onNew) {
      console.log("🎧 [SOCKET] Subscribed to: newMessage");
      socket.on("newMessage", onNew);
    }
    if (onRecalled) {
      console.log("🎧 [SOCKET] Subscribed to: messageRecalled");
      socket.on("messageRecalled", onRecalled);
    }
  },

  unsubscribeGroupMessages: (onNew, onRecalled) => {
    if (!socket) return console.warn("⚠️ [SOCKET] Not connected yet!");
    if (onNew) {
      console.log("🔇 [SOCKET] Unsubscribed from: newMessage");
      socket.off("newMessage", onNew);
    }
    if (onRecalled) {
      console.log("🔇 [SOCKET] Unsubscribed from: messageRecalled");
      socket.off("messageRecalled", onRecalled);
    }
  },

  // ============================================================
  // 🔵 REST METHODS (Private Chat)
  // ============================================================
  async getChatsByClass(classId) {
    console.log(`📡 [REST] GET /chat/${classId}`);
    const res = await axios.get(`${API_BASE}/chat/${classId}`, {
      headers: { ...authHeader() },
    });
    return res.data;
  },

  async createChat(payload) {
    console.log("📝 [REST] POST /chat →", payload);
    const res = await axios.post(`${API_BASE}/chat`, payload, {
      headers: { "Content-Type": "application/json", ...authHeader() },
    });
    return res.data;
  },

  async revokeChat(chatId, isRevoked = true) {
    console.log(`🗑️ [REST] PATCH /chat/revoke/${chatId} → isRevoked=${isRevoked}`);
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
    console.log(
      `📖 [REST] POST /chat/read-messages → classId=${classId}, readerId=${readerId}, role=${readerRole}`
    );
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
