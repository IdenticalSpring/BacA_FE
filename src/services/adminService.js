// src/services/adminService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const adminService = {
  getAllAdmin: async () => {
    try {
      const token = sessionStorage.getItem("token"); // Lấy token
      const response = await axios.get(`${API_BASE_URL}/admins/`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching admin";
    }
  },
  getAdminById: async (id) => {
    try {
      const token = sessionStorage.getItem("token"); // Lấy token
      const response = await axios.get(`${API_BASE_URL}/admins/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`, // Thêm token vào header
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching admin";
    }
  },

  editAdmin: async (id, adminData) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${API_BASE_URL}/admins/${id}`, adminData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating admin";
    }
  },
};

export default adminService;
