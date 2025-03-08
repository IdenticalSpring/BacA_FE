import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Lấy URL từ .env

const authService = {
  login: async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, { username, password });
      localStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },
};
export default authService;
