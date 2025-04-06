import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const teacherFeedbackService = {
  getAllteacherFeedbackk: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-feedback`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback list";
    }
  },
  getTeacherFeedbackById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-feedback/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback";
    }
  },
  getFeedbackByStudentId: async (teacherID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-feedback/teacher/${teacherID}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching feedback";
    }
  },
  createTeacherFeedback: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teacher-feedback`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating feedback";
    }
  },

  editTeacherFeedback: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/teacher-feedback/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating feedback";
    }
  },

  deleteTeacherFeedback: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/teacher-feedback/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Level deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting feedback";
    }
  },
};
export default teacherFeedbackService;
