import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Lấy URL từ .env

const authService = {
  loginAdmin: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, { username, password });
      sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },
  logout: () => {
    sessionStorage.removeItem("token"); // Xóa token
  },
  loginTeacher: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/teacher/login`, {
        username,
        password,
      });
      sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },
  loginStudent: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/student/login`, {
        username,
        password,
      });
      sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },
};
export default authService;
