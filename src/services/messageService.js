// src/services/messageService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Helper để lấy token từ sessionStorage
const getAuthToken = () => sessionStorage.getItem("token");

const messageService = {
  /**
   * Lấy tất cả tin nhắn của một lớp học cụ thể
   * @param {number} classId ID của lớp học
   * @returns {Promise<Array>} Mảng các tin nhắn
   */
  getMessagesForClass: async (classId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages/class/${classId}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      // Dữ liệu trả về từ backend đã bao gồm senderStudent và senderTeacher
      return response.data;
    } catch (error) {
      console.error("Error fetching messages for class:", error);
      throw error.response?.data?.message || "Không thể tải lịch sử tin nhắn";
    }
  },
};

export default messageService;
