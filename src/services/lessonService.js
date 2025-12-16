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
  enhanceLessonPlan: async (lessonPlan, imageUrls = []) => {
    try {
      console.log("📤 Sending enhance-lesson-plan request...");
      console.log("📝 Lesson plan length:", lessonPlan?.length || 0);
      console.log("🖼️ Images count:", imageUrls?.length || 0);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/chatbot/enhance-lesson-plan`,
        { lessonPlan, imageUrls },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 65000, // 65 seconds timeout
        }
      );

      console.log("✅ Response received successfully");
      return response.data.response;
    } catch (error) {
      console.error("❌ Error enhancing lesson plan:", error);

      // Provide more specific error messages
      if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
        throw new Error("Request timeout. Please try with fewer images or simpler content.");
      }
      if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
        throw new Error("Cannot connect to server. Please check if backend is running.");
      }
      if (error.response?.status === 500) {
        throw new Error(error.response?.data?.message || "Server error. Please try again later.");
      }

      throw new Error(
        error.response?.data?.message || "Failed to enhance lesson plan. Please try again!"
      );
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
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating lesson";
    }
  },

  // 👇 THÊM HÀM MỚI VÀO ĐÂY
  reassignTeacherForLessons: async (reassignData) => {
    // reassignData sẽ có dạng { oldTeacherId, newTeacherId }
    try {
      const response = await axios.put(`${API_BASE_URL}/lessons/reassign-teacher`, reassignData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data; // Trả về { message, updatedCount }
    } catch (error) {
      throw error.response?.data?.message || "Error reassigning lessons";
    }
  },

  editLesson: async (id, lessonData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/lessons/${id}`, lessonData, {
        headers: {
          "Content-Type": "application/json",
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
