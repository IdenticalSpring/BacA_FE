import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const testService = {
  getAllTest: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching test list";
    }
  },

  createTest: async (testData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/test`, testData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating test";
    }
  },

  editTest: async (id, testData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/test/${id}`, testData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating test";
    }
  },

  deleteTest: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/test/${id}`);
      return { message: "Test deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting teacher";
    }
  },
};

export default testService;
