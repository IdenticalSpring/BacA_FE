import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const assessmentService = {
  getAllAssessments: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assessments`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching assessments list";
    }
  },
  getAssessmentsById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assessments/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching assessment";
    }
  },
  createAssessments: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/assessments`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating assessment";
    }
  },

  editAssessments: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/assessments/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating assessment";
    }
  },

  deleteAssessments: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/assessments/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Assessment deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting assessment";
    }
  },
};
export default assessmentService;
