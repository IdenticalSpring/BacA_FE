import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const feedbackService = {
  getAllFeedback: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback list";
    }
  },
  getFeedbackById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback";
    }
  },
  getFeedbackByStudentId: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/feedback/student/${studentId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback";
    }
  },
  createFeedback: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating feedback";
    }
  },

  editFeedback: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/feedback/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating feedback";
    }
  },

  deleteFeedback: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/feedback/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Level deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting feedback";
    }
  },
};
export default feedbackService;
