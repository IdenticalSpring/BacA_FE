import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const studentService = {
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student list";
    }
  },
  getStudentById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student";
    }
  },
  getStudentByIdAndLogin: async (id) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/students/find-and-login`,
        { studentId: id },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const token = response.data;
      sessionStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      sessionStorage.setItem("role", decoded.role);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student";
    }
  },
  getAllStudentsbyClass: async (classID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/class/${classID}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student list";
    }
  },
  countAllStudentOfCall: async (classId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/classCount/${classId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student list";
    }
  },
  createStudentWithFile: async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, formData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          // Note: Don't use formData.getHeaders() in browser code
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student";
    }
  },
  editStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error.response?.data?.message || error.message || "Error updating student";
    }
  },

  removeClassFromStudent: async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/students/${id}/remove-class`,
        {},
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error removing student from class";
    }
  },

  requestDeleteStudent: async (id) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/students/${id}/request-delete`,
        {},
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi gửi yêu cầu xóa học sinh";
    }
  },

  async getEvaluationStudent(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-comments/student/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in evaluationStudent:", error);
      throw error;
    }
  },

  async getEvaluationSkillStudent(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentskillbehaviorscores/student/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error in evaluationStudent:", error);
      throw error;
    }
  },

  deleteStudent: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Student deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting student";
    }
  },
};

export default studentService;
