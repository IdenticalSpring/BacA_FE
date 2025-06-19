import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class QuestionService {
  async createQuestion(questionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/questions`, questionData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create question: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getAllQuestions() {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch questions: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getQuestionById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch question: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async updateQuestion(id, questionData) {
    try {
      const response = await axios.patch(`${API_BASE_URL}/questions/${id}`, questionData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update question: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async getQuestionsByHomeworkId(homeworkId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/questions/by-homework/${homeworkId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch questions for homework: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async deleteQuestion(id) {
    try {
      await axios.delete(`${API_BASE_URL}/questions/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete question: ${error.response?.data?.message || error.message}`
      );
    }
  }
}

export default new QuestionService();
