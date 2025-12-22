import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const teacherService = {
  getAllTeachers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching teacher list";
    }
  },

  getTeacherById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching teacher list";
    }
  },

  // Create a new teacher
  createTeacher: async (teacherData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/teachers`, teacherData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create teacher");
    }
  },

  // Update an existing teacher
  editTeacher: async (id, teacherData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/teachers/${id}`, teacherData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || `Failed to update teacher with ID ${id}`);
    }
  },

  deleteTeacher: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/teachers/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "Teacher deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting teacher";
    }
  },

  toggleDisableTeacher: async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/teachers/${id}/toggle-disable`, {}, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error toggling teacher status";
    }
  },
  async evaluationStudent(payload) {
    try {
      const response = await axios.post(`${API_BASE_URL}/teacher-comments`, payload, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Payload gửi lên:", payload);

      return response.data;
    } catch (error) {
      console.error("Error in evaluationStudent:", error);
      throw error;
    }
  },
  skillScoreStudent: async (payload) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/studentskillbehaviorscores`, payload, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving student skill behavior scores:", error);
      throw error;
    }
  },
  async attendanceStudent(payload) {
    try {
      const response = await axios.post(`${API_BASE_URL}/checkins`, payload, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Payload gửi lên:", payload);

      return response.data;
    } catch (error) {
      console.error("Error in attendanceStudent:", error);
      throw error;
    }
  },
  async updateAttendanceByDate(payload, date) {
    try {
      const response = await axios.put(`${API_BASE_URL}/checkins/date/${date}`, payload, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("Payload gửi lên:", payload);

      return response.data;
    } catch (error) {
      console.error("Error in attendanceStudent:", error);
      throw error;
    }
  },

  getAllCheckins: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkins`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching checkins list";
    }
  },
  // Trong teacherService.js
  getAttendanceByDate: async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/checkins/date/${date}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching attendance by date";
    }
  },
  getCommentByDate: async (date) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teacher-comments/date/${date}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching comments by date";
    }
  },
  async updateTeacherComment(studentID, date, updateData) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/teacher-comments/student/${studentID}/date/${date}`,
        updateData,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error in Comments:", error);
      throw error;
    }
  },
  async getStudentScoreSkillandBehaviorByDate(date) {
    try {
      const response = await axios.get(`${API_BASE_URL}/studentskillbehaviorscores/date/${date}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error in Score:", error);
      throw error;
    }
  },
  async updateStudentScoreSkillandBehaviorByDate(studentID, date, payload) {
    try {
      const updatePromises = payload.map(async (item) => {
        const response = await axios.put(
          `${API_BASE_URL}/studentskillbehaviorscores/student/${studentID}/date/${date}`,
          item,
          {
            headers: {
              "ngrok-skip-browser-warning": "true",
            },
          }
        );
        return response.data;
      });
      const results = await Promise.all(updatePromises);
      return results;
    } catch (error) {
      throw error;
    }
  },
};

export default teacherService;
