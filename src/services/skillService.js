import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const skillService = {
  getAllSkill: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/skills`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching skills list";
    }
  },
  getSkillById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/skills/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching level";
    }
  },
  createSkill: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/skills`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating level";
    }
  },

  editSkill: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/skills/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating level";
    }
  },

  deleteSkill: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/skills/${id}`, {
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
export default skillService;
