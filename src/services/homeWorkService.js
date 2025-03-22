import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const homeWorkService = {
  getAllHomeWork: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeWork list";
    }
  },
  getHomeWorkById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks";
    }
  },
  getHomeWorkByLevelAndTeacherId: async (levelAndTeacherId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/homeworks/level`, levelAndTeacherId);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks list";
    }
  },
  getHomeWorkByTeacherId: async (TeacherId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks/teacher/${TeacherId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks list";
    }
  },
  createHomeWork: async (homeWorkData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/homeworks`, homeWorkData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating homeWork";
    }
  },

  editHomeWork: async (id, homeWorkData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/homeworks/${id}`, homeWorkData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating homeWork";
    }
  },

  deleteHomeWork: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/homeworks/${id}`);
      return { message: "HomeWork deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting homework";
    }
  },
};
export default homeWorkService;
