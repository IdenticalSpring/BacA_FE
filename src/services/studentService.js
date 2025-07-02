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
      throw error.response?.data?.message || "Error logging in student";
    }
  },

  getAllStudentsByClass: async (classID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/class/${classID}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching students by class";
    }
  },

  countAllStudentOfClass: async (classId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/classCount/${classId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error counting students in class";
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, studentData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student";
    }
  },

  editStudent: async (id, studentData) => {
    try {
      console.log("Sending student data for edit:", studentData); // Log payload for debugging

      const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error.response?.data?.message || "Error updating student";
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
      throw error.response?.data?.message || "Error requesting student deletion";
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
