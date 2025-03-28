import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const testSkillService = {
  getAllTestSkill: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test-skills`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching test skill list";
    }
  },

  createTestSkill: async (testData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/test-skills`, testData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating test skill";
    }
  },

  editTestSkill: async (id, testData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/test-skills/${id}`, testData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating test skill";
    }
  },

  deleteTestSkill: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/test-skills/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Test deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting test skill";
    }
  },
};

export default testSkillService;
