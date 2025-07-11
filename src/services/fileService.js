// src/services/fileService.js
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const fileService = {
  upload: async (file, fileName) => {
    const formData = new FormData();
    formData.append("file", file, fileName);

    try {
      // Endpoint này cần được tạo ở backend của bạn
      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "ngrok-skip-browser-warning": "true", // Nếu bạn dùng ngrok
        },
      });
      // Giả định backend trả về một object có chứa `url` của file đã upload
      return response.data.url;
    } catch (error) {
      console.error("File upload error:", error);
      throw new Error(error.response?.data?.message || "File upload failed");
    }
  },
};

export default fileService;
