import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const teacherService = {
  getAllTeachers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching teacher list";
    }
  },

  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teachers`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating teacher";
    }
  },

  editTeacher: async (id, teacherData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/teachers/${id}`, teacherData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating teacher";
    }
  },

  deleteTeacher: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/teachers/${id}`);
      return { message: "Teacher deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting teacher";
    }
  },
};

export default teacherService;
