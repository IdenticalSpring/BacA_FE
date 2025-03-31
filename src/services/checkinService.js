import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const checkinService = {
  getAllCheckinOfStudent: async (studentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkins/student/${studentId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);

      throw error.response?.data?.message || "Error fetching checkin";
    }
  },
  getAllCheckins: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkins`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.log(error);

      throw error.response?.data?.message || "Error fetching checkin";
    }
  },
};
export default checkinService;
