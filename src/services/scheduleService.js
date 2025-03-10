import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const scheduleService = {
  getAllSchedules: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/schedules`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching schedule list";
    }
  },
  getScheduleByDayOfWeek: async (dayOfWeek) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schedules/day-of-week`, dayOfWeek);
      console.log(response.data, "ádasd");

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching schedule list";
    }
  },
  createSchedule: async (scheduleData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/schedules`, scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating schedule";
    }
  },

  editSchedule: async (id, scheduleData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/schedules/${id}`, scheduleData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating schedule";
    }
  },

  deleteSchedule: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/schedules/${id}`);
      return { message: "Schedule deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting schedule";
    }
  },
};

export default scheduleService;
