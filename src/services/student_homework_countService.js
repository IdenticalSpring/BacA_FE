import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const student_homework_countService = {
  getAllStudent_homework_count: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_homework_count`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_homework_count list";
    }
  },
  getStudent_homework_countById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_homework_count/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_homework_count";
    }
  },
  createStudent_homework_count: async (student_homework_countData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/student_homework_count`,
        student_homework_countData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student_homework_count";
    }
  },

  editStudent_homework_count: async (id, student_homework_countData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/student_homework_count/${id}`,
        student_homework_countData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating student_homework_count";
    }
  },
  updateCount: async (student_homework_countData) => {
    try {
      await axios.patch(`${API_BASE_URL}/student_homework_count/`, student_homework_countData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "student_homework_count update count successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error update count student_homework_count";
    }
  },
  getAllCount: async (students) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/student_homework_count/getAllCounts`,
        students,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.log(error);

      throw error.response?.data?.message || "Error fetching student_homework_count list";
    }
  },
  deleteStudent_homework_count: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/student_homework_count/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "student_homework_count deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting student_homework_count";
    }
  },
};
export default student_homework_countService;
