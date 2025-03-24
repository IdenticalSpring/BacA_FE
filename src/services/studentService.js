import axios from "axios";

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

  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, studentData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
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
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating student";
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
