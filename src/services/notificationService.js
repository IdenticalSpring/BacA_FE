import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getAuthToken = () => sessionStorage.getItem("token");
const notificationService = {
  getAllNotifications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notification`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching notification list";
    }
  },
  getAllGeneralNotifications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notification/general`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching notification list";
    }
  },
  getNotificationById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notification/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching notification";
    }
  },
  createNotification: async (notificationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/notification`, notificationData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating notification";
    }
  },
  editNotification: async (id, notificationData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/notification/${id}`, notificationData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      // Cải thiện việc xử lý lỗi
      console.error("Error updating notification:", error);
      throw error.response?.data?.message || error.message || "Error updating notification";
    }
  },

  deleteNotification: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/notification/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Notification deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting notification";
    }
  },
};

export default notificationService;
