import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const levelService = {
  getAllLevels: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/levels`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching levels list";
    }
  },
  getLevelById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/levels/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching level";
    }
  },
  createLevel: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/levels`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating level";
    }
  },

  editLevel: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/levels/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating level";
    }
  },

  deleteLevel: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/levels/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Level deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting level";
    }
  },
};
export default levelService;
