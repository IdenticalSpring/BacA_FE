import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getAuthToken = () => sessionStorage.getItem("token");

const classService = {
  getAllClasses: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching class list";
    }
  },

  getAllClassesByTeacher: async (teacherid) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/classes/teacher/${teacherid}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching class list";
    }
  },

  createClass: async (classData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/classes`, classData, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating class";
    }
  },

  editClass: async (id, classData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/classes/${id}`, classData, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating class";
    }
  },

  deleteClass: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/classes/${id}`, {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      return { message: "Class deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting class";
    }
  },
};

export default classService;
