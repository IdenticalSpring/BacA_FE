import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const lessonByScheduleService = {
  createLessonBySchedule: async (lessonByScheduleData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/bulk-create`,
        lessonByScheduleData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating lesson by schedule";
    }
  },
};
export default lessonByScheduleService;
