import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const sidebarLinkService = {
  createSidebar: async (data) => {
    const response = await axios.post(`${API_BASE_URL}/sidebar`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  getAllSidebars: async () => {
    const response = await axios.get(`${API_BASE_URL}/sidebar`);
    return response.data;
  },
  updateSidebar: async (id, data) => {
    const response = await axios.put(`${API_BASE_URL}/sidebar/${id}`, data, {
      headers: {
        "Content-Type": "application/json",
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
