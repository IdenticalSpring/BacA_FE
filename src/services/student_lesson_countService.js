import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const student_lesson_countService = {
  getAllStudent_lesson_count: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_lesson_count`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_lesson_count list";
    }
  },
  getStudent_lesson_countById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_lesson_count/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_lesson_count";
    }
  },
  createStudent_lesson_count: async (student_lesson_countData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/student_lesson_count`,
        student_lesson_countData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student_lesson_count";
    }
  },

  editStudent_lesson_count: async (id, student_lesson_countData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/student_lesson_count/${id}`,
        student_lesson_countData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating student_lesson_count";
    }
  },
  updateCount: async (student_lesson_countData) => {
    try {
      await axios.patch(`${API_BASE_URL}/student_lesson_count/`, student_lesson_countData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "student_lesson_count update count successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error update count student_lesson_count";
    }
  },
  getAllCount: async (students) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/student_lesson_count/getAllCounts`,
        students,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_lesson_count list";
    }
  },
  deleteStudent_lesson_count: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/student_lesson_count/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "student_lesson_count deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting student_lesson_count";
    }
  },
};
export default student_lesson_countService;
