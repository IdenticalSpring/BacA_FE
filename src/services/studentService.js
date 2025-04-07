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

  editStudent: async (id, studentData, file) => {
    try {
      const formData = new FormData();

      // Append student data to formData
      Object.keys(studentData).forEach((key) => {
        formData.append(key, studentData[key]);
      });

      // Append file to formData if provided
      if (file) {
        formData.append("file", file);
      }

      const response = await axios.put(`${API_BASE_URL}/students/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      // Cải thiện việc xử lý lỗi
      console.error("Error updating student:", error);
      throw error.response?.data?.message || error.message || "Error updating student";
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
