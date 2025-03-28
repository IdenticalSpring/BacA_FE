import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const StudentScoreService = {
  getAllStudentScore: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentScore`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching levels list";
    }
  },
  getAllStudentScoreDetails: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-score-details`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching levels list";
    }
  },
  getScorebyStudentID: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentScore/student/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching level";
    }
  },
  createScoreStudent: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/studentScore`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating Score";
    }
  },

  createScoreStudentDetails: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/student-score-details`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating Score";
    }
  },

  editScoreStudent: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/studentScore/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating Score";
    }
  },

  deleteScoreStudent: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/studentScore/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Score deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting Score";
    }
  },
};
export default StudentScoreService;
