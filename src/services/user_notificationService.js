import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getAuthToken = () => sessionStorage.getItem("token");
const user_notificationService = {
  getAllUserNotifications: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user_notification`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching user_notification list";
    }
  },
  getAllUserNotificationsOfStudent: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user_notification/student/${studentId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching user_notification list";
    }
  },
  getUserNotificationById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user_notification/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching user_notification";
    }
  },
  createUserNotification: async (userNotificationData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/user_notification`, userNotificationData, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating user_notification";
    }
  },
  editUserNotification: async (id, userNotificationData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/user_notification/${id}`,
        userNotificationData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      // Cải thiện việc xử lý lỗi
      console.error("Error updating user_notification:", error);
      throw error.response?.data?.message || error.message || "Error updating user_notification";
    }
  },

  deleteUserNotification: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/user_notification/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "User_notification deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting user_notification";
    }
  },
};

export default user_notificationService;
