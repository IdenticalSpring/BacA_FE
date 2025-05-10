import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const student_vocabularyService = {
  getAllStudent_vocabulary: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_vocabulary`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_vocabulary list";
    }
  },
  getStudent_vocabularyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student_vocabulary/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_vocabularies";
    }
  },
  getStudent_vocabularyByHomeworkIdAndStudentId: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/student_vocabulary/homework`, data, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student_vocabularies list";
    }
  },
  createStudent_vocabulary: async (student_vocabularyData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/student_vocabulary`,
        student_vocabularyData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student_vocabulary";
    }
  },

  editStudent_vocabulary: async (id, student_vocabularyData) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/student_vocabulary/${id}`,
        student_vocabularyData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating student_vocabulary";
    }
  },
  deleteStudent_vocabulary: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/student_vocabulary/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "student_vocabulary deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting student_vocabulary";
    }
  },
};
export default student_vocabularyService;
