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

  createTeacher: async (teacherData, files) => {
    try {
      const formData = new FormData();
      Object.keys(teacherData).forEach((key) => {
        formData.append(key, teacherData[key]);
      });

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file); // Append từng file vào key "files"
        });
      }

      const response = await axios.post(`${API_BASE_URL}/teachers`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating teacher:", error);
      throw error;
    }
  },

  editTeacher: async (id, teacherData, files) => {
    try {
      const formData = new FormData();
      Object.keys(teacherData).forEach((key) => {
        formData.append(key, teacherData[key]);
      });

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file); // Append từng file vào key "files"
        });
      }

      const response = await axios.put(`${API_BASE_URL}/teachers/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating teacher with ID ${id}:`, error);
      throw error;
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
};

export default teacherService;
