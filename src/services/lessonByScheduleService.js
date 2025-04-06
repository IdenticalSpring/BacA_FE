import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const lessonByScheduleService = {
  createLessonBySchedule: async (lessonByScheduleData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/bulk-create`,
        lessonByScheduleData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating lesson by schedule";
    }
  },
  getAllLessonBySchedules: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lesson-by-schedule`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lesson by schedule list";
    }
  },
  getAllLessonBySchedulesOfClass: async (classId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lesson-by-schedule/class/${classId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lesson by schedule list";
    }
  },
  getSchedulesByClass: async (id) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/lesson-by-schedule/schedules_by_class/${id}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
  updateLessonBySchedule: async (id, lessonByScheduleData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/lesson-by-schedule/${id}`,
        lessonByScheduleData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
  updateLessonOfLessonBySchedule: async (id, lessonID) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/updateLesson/${id}`,
        { lessonID },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
  updateHomeWorkLessonBySchedule: async (id, homeWorkId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/updateHomework/${id}`,
        { homeWorkId },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
  updateSendingHomeworkStatus: async (id, isHomeWorkSent) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/updateIsHomeWorkSent/${id}`,
        { isHomeWorkSent },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
  updateSendingLessonStatus: async (id, isLessonSent) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/lesson-by-schedule/updateIsLessonSent/${id}`,
        { isLessonSent },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson by schedule";
    }
  },
};

export default lessonByScheduleService;
