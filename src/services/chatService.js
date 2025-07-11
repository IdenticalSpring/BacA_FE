import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const chatService = {
  // Tạo một chat mới
  createChat: async (chatData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, chatData);
      return response.data;
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error.response?.data || error.message;
    }
  },

  // Lấy danh sách chat theo classId
  getChatsByClass: async (classId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/chat/${classId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching chats by class:", error);
      throw error.response?.data || error.message;
    }
  },

  // Thu hồi chat
  revokeChat: async (chatId, isRevoked) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/chat/revoke/${chatId}`, { isRevoked });
      return response.data;
    } catch (error) {
      console.error("Error revoking chat:", error);
      throw error.response?.data || error.message;
    }
  },
  markMessagesAsRead: async (classId, partnerId, readerRole) => {
    try {
      const payload = {
        classId,
        readerId: partnerId, // BE mong đợi readerId, chính là partnerId
        readerRole,
      };
      const response = await axios.post(`${API_BASE_URL}/chat/read-messages`, payload);
      return response.data;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error.response?.data || error.message;
    }
  },
};

export default chatService;
