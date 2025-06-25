import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class StudentQuestionAnswerService {
  async createStudentQuestionAnswer(answerData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/student-question-answers`, answerData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to create student question answer: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async getAllStudentQuestionAnswers() {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-question-answers`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch student question answers: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async getStudentQuestionAnswerById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-question-answers/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch student question answer: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async updateStudentQuestionAnswer(id, answerData) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/student-question-answers/${id}`,
        answerData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to update student question answer: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async getStudentQuestionAnswersByHomeworkId(homeworkId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student-question-answers/by-homework/${homeworkId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch student question answers for homework: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }

  async getStudentQuestionAnswersByQuestionId(questionId, studentId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student-question-answers/by-question/${questionId}/student/${studentId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(
        `Failed to fetch student question answers for question: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
  async suggestAnswerQuestion(question, imageUrl) {
    if (!question && !imageUrl) {
      throw new Error("At least one of question or imageUrl must be provided.");
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/chatbot/analyze`,
        { question: question || null, imageUrl: imageUrl || null },
        {
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data.response;
    } catch (error) {
      console.error("Error suggesting answer:", error);
      throw new Error(
        `Failed to suggest answer: ${error.response?.data?.message || error.message}`
      );
    }
  }

  async deleteStudentQuestionAnswer(id) {
    try {
      await axios.delete(`${API_BASE_URL}/student-question-answers/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
    } catch (error) {
      throw new Error(
        `Failed to delete student question answer: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  }
}

export default new StudentQuestionAnswerService();
