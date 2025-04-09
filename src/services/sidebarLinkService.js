import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const sidebarLinkService = {
  createSidebar: async (data, file) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("type", data.type);
    formData.append("link", data.link);
    formData.append("img", file); // File ảnh

    const response = await axios.post(`${API_BASE_URL}/sidebar`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  getAllSidebars: async () => {
    const response = await axios.get(`${API_BASE_URL}/sidebar`);
    return response.data;
  },
  updateSidebar: async (id, data, file) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.type !== undefined) formData.append("type", data.type);
    if (data.link) formData.append("link", data.link);
    if (file) formData.append("img", file); // File ảnh mới (nếu có)

    const response = await axios.put(`${API_BASE_URL}/sidebar/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
  deleteSidebar: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/sidebar/${id}`);
    return response.data;
  },
};

export default sidebarLinkService;
