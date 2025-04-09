import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const pagevisitService = {
  incrementVisit: async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pagevisit/increment`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching visitor list";
    }
  },
  getCountVisitor: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pagevisit/count`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching count visiter";
    }
  },
  getStatsVisitor: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pagevisit/stats`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching count visiter";
    }
  },
};
export default pagevisitService;
