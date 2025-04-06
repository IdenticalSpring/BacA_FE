import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const getAuthToken = () => sessionStorage.getItem("token");
const classScheduleService = {
  createClassSchedule: async (classSchedulesData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/class-schedules/many`,
        classSchedulesData,
        {
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating class schedule:", error);
      throw error.response?.data?.message || "Error creating class class schedule";
    }
  },
};
export default classScheduleService;
