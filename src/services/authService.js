// import axios from "axios";

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Lấy URL từ .env

// const authService = {
//   loginAdmin: async (username, password) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/admin/login`, { username, password });
//       sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
//       return response.data;
//     } catch (error) {
//       throw error.response?.data?.message || "Lỗi đăng nhập";
//     }
//   },
//   logout: () => {
//     sessionStorage.removeItem("token"); // Xóa token
//   },
//   loginTeacher: async (username, password) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/teacher/login`, {
//         username,
//         password,
//       });
//       sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
//       return response.data;
//     } catch (error) {
//       throw error.response?.data?.message || "Lỗi đăng nhập";
//     }
//   },
//   loginStudent: async (username, password) => {
//     try {
//       const response = await axios.post(`${API_BASE_URL}/auth/student/login`, {
//         username,
//         password,
//       });
//       sessionStorage.setItem("token", response.data.token); // Lưu token sau khi đăng nhập
//       return response.data;
//     } catch (error) {
//       throw error.response?.data?.message || "Lỗi đăng nhập";
//     }
//   },
// };
// export default authService;
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // Import đúng cách

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL; // Lấy URL từ .env

const authService = {
  loginAdmin: async (username, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/admin/login`,
        { username, password },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const token = response.data.token;

      sessionStorage.setItem("token", token); // Lưu token vào sessionStorage

      // Giải mã token để lấy role
      const decoded = jwtDecode(token);
      sessionStorage.setItem("role", decoded.role);

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },

  loginTeacher: async (username, password) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/teacher/login`,
        {
          username,
          password,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const token = response.data.token;

      sessionStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      sessionStorage.setItem("role", decoded.role);

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },

  loginStudent: async (username, password) => {
    try {
      const body = { username };
      if (password) {
        body.password = password;
      }
      const response = await axios.post(
        `${API_BASE_URL}/auth/student/login`,
        body,
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      const token = response.data.token;

      sessionStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      sessionStorage.setItem("role", decoded.role);

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Lỗi đăng nhập";
    }
  },

  // Kiểm tra học sinh có cần nhập mật khẩu không
  checkStudentPassword: async (username) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/student/check-password`,
        { username },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return response.data; // { requiresPassword: boolean }
    } catch (error) {
      throw error.response?.data?.message || "Lỗi kiểm tra tài khoản";
    }
  },

  logout: () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role"); // Xóa role khi đăng xuất
  },
};

export default authService;
