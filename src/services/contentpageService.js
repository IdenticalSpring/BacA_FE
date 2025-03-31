import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const contentPageService = {
  getAllContentPages: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contentpage`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching contentpage list";
    }
  },
  getContentPageById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/contentpage/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching contentpage";
    }
  },
  createContentPage: async (contentpage) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/contentpage`, contentpage, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating contentpage";
    }
  },

  editContentPage: async (id, contentpage) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/contentpage/${id}`, contentpage, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating contentpage";
    }
  },

  deleteContentPage: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/contentpage/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "ContentPage deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting contentpage";
    }
  },
};
export default contentPageService;
