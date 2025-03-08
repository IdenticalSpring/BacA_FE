import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const teacherService = {
  getAllTeachers: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/teachers`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi khi lấy danh sách giáo viên";
    }
  },
};

export default teacherService;
