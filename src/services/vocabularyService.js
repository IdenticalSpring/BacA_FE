import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const vocabularyService = {
  getAllVocabulary: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vocabularies`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching vocabulary list";
    }
  },
  getVocabularyByHomworkId: async (homeworkId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vocabularies/homework/${homeworkId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching vocabularies";
    }
  },
  getVocabularyById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vocabularies/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching vocabularies";
    }
  },
  createVocabulary: async (vocabularyData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/vocabularies`, vocabularyData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating vocabulary";
    }
  },
  bulkCreateVocabulary: async (vocabularyDatas) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/vocabularies/bulk-create`,
        vocabularyDatas,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating vocabulary";
    }
  },

  editvocabulary: async (id, vocabularyData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/vocabularies/${id}`, vocabularyData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating vocabulary";
    }
  },
  deletevocabulary: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/vocabularies/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "vocabulary deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting vocabulary";
    }
  },
};
export default vocabularyService;
