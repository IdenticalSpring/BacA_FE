// src/services/chatTopicService.js
import { io } from "socket.io-client";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE_URL;
const SOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL;

let socket = null;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const chatTopicService = {
  connect: () => {
    if (socket) return socket;
    const token = localStorage.getItem("token");
    socket = io(`${SOCKET_URL}/chat-topic`, {
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

  joinTopicRoom: (classId) => {
    if (!socket) return;
    socket.emit("joinClassTopic", { classId });
  },

  onNewTopic: (callback) => {
    if (!socket) return;
    socket.on("newTopic", callback);
  },

  offNewTopic: (callback) => {
    if (!socket) return;
    socket.off("newTopic", callback);
  },

  async createTopic(payload) {
    const res = await axios.post(`${API_BASE}/chat-topic/create`, payload, {
      headers: { "Content-Type": "application/json", ...authHeader() },
    });
    return res.data;
  },

  async getLatestTopic(classId) {
    const res = await axios.get(`${API_BASE}/chat-topic/latest/${classId}`, {
      headers: { ...authHeader() },
    });
    return res.data?.topic || null;
  },
};

export default chatTopicService;
