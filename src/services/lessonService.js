import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const lessonService = {
  getAllLessons: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lessons`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lessons list";
    }
  },
  getLessonById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lessons/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lesson";
    }
  },
  getLessonByLevelAndTeacherId: async (levelAndTeacherId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/lessons/level`, levelAndTeacherId, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lessons list";
    }
  },
  enhanceDescription: async (description) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/chatbot/enhance`, // Đường dẫn tới endpoint NestJS
        { description },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.response; // Trả về nội dung đã cải thiện
    } catch (error) {
      console.error("Error enhancing description:", error);
      throw new Error("Failed to enhance description. Please try again!");
    }
  },
  enhanceLessonPlan: async (description) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/chatbot/enhance-lesson-plan`, // Đường dẫn tới endpoint NestJS
        { description },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.response; // Trả về nội dung đã cải thiện
    } catch (error) {
      console.error("Error enhancing lesson plan:", error);
      throw new Error("Failed to enhance lesson plan. Please try again!");
    }
  },
  getLessonByTeacherId: async (TeacherId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lessons/teacher/${TeacherId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching lessons list";
    }
  },
  createLesson: async (lessonData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/lessons`, lessonData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating lesson";
    }
  },

  editLesson: async (id, lessonData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/lessons/${id}`, lessonData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating lesson";
    }
  },
  deleteLesson: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/lessons/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Lesson deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting lesson";
    }
  },
};
export default lessonService;
