import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const studentService = {
  getAllStudents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student list";
    }
  },

  getAllStudentsbyClass: async (classID) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/students/class/${classID}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student list";
    }
  },

  createStudent: async (studentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/students`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating student";
    }
  },

  editStudent: async (id, studentData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/students/${id}`, studentData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating student";
    }
  },

  deleteStudent: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/students/${id}`);
      return { message: "Student deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting student";
    }
  },
};

export default studentService;
