import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const StudentScoreService = {
  getAllStudentScore: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentScore`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching levels list";
    }
  },
  // Hàm mới: Lấy và xử lý student-score-details
  getAllStudentScoreDetailsProcessed: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-score-details`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      const details = response.data;

      // Nhóm dữ liệu theo studentScoreID
      const groupedDetails = details.reduce((acc, detail) => {
        const { studentScoreID, testSkill, score } = detail;
        if (!acc[studentScoreID]) {
          acc[studentScoreID] = {
            studentScoreID,
            scores: {},
            avgScore: detail.avgScore || "-",
          };
        }
        acc[studentScoreID].scores[testSkill.name] = score;
        return acc;
      }, {});

      return Object.values(groupedDetails);
    } catch (error) {
      throw error.response?.data?.message || "Error fetching processed score details";
    }
  },
  getCombinedStudentScores: async (studentIds = []) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentScore`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      const scores = response.data;
      const filteredScores =
        studentIds.length > 0
          ? scores.filter((score) => studentIds.includes(score.studentID))
          : scores;

      return filteredScores.map((score) => ({
        studentScoreID: score.id,
        studentID: score.studentID,
        classTestScheduleID: score.classTestScheduleID,
        assessmentID: score.assessmentID,
        teacherComment: score.teacherComment || "-",
        scores: {}, // Sẽ được ghép với student-score-details
        avgScore: "-", // Sẽ được cập nhật từ student-score-details
      }));
    } catch (error) {
      throw error.response?.data?.message || "Error fetching student scores";
    }
  },
  getScoreDetailsByStudentId: async (studentId) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/student-score-details/student/${studentId}`,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching score details by student ID";
    }
  },
  getAllStudentScoreDetails: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/student-score-details`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching levels list";
    }
  },
  getScorebyStudentID: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentScore/student/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching level";
    }
  },
  createScoreStudent: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/studentScore`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating Score";
    }
  },

  createScoreStudentDetails: async (levelData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/student-score-details`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating Score";
    }
  },

  editScoreStudent: async (id, levelData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/studentScore/${id}`, levelData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating Score";
    }
  },

  deleteScoreStudent: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/studentScore/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Score deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting Score";
    }
  },
};
export default StudentScoreService;
