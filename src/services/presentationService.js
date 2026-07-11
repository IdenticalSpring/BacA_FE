import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const authHeaders = (extraHeaders = {}) => {
  const token = sessionStorage.getItem("token");
  return {
    "ngrok-skip-browser-warning": "true",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
};

const presentationService = {
  createPresentation: async (presentationData) => {
    const response = await axios.post(`${API_BASE_URL}/presentations`, presentationData, {
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    return response.data;
  },

  updatePresentation: async (id, presentationData) => {
    const response = await axios.put(`${API_BASE_URL}/presentations/${id}`, presentationData, {
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    return response.data;
  },

  getPresentation: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/presentations/${id}`, {
      headers: authHeaders(),
    });
    return response.data;
  },

  getPresentationsByLesson: async (lessonId) => {
    const response = await axios.get(`${API_BASE_URL}/presentations/lesson/${lessonId}`, {
      headers: authHeaders(),
    });
    return response.data;
  },

  uploadAsset: async (presentationId, file, metadata = {}) => {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata && Object.keys(metadata).length) {
      formData.append("metadataJson", JSON.stringify(metadata));
    }

    const response = await axios.post(
      `${API_BASE_URL}/presentations/${presentationId}/assets`,
      formData,
      {
        headers: authHeaders({ "Content-Type": "multipart/form-data" }),
      }
    );
    return response.data;
  },

  createShare: async (presentationId, shareConfig) => {
    const response = await axios.post(
      `${API_BASE_URL}/presentations/${presentationId}/shares`,
      shareConfig,
      {
        headers: authHeaders({ "Content-Type": "application/json" }),
      }
    );
    return response.data;
  },

  getSharedPresentation: async (token) => {
    const response = await axios.get(`${API_BASE_URL}/presentations/share/${token}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    });
    return response.data;
  },

  copySharedPresentation: async (token) => {
    const response = await axios.post(
      `${API_BASE_URL}/presentations/share/${token}/copy`,
      {},
      {
        headers: authHeaders({ "Content-Type": "application/json" }),
      }
    );
    return response.data;
  },

  getTags: async (category) => {
    const response = await axios.get(`${API_BASE_URL}/presentations/tags`, {
      params: category ? { category } : {},
      headers: authHeaders(),
    });
    return response.data;
  },

  createTag: async (tagData) => {
    const response = await axios.post(`${API_BASE_URL}/presentations/tags`, tagData, {
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    return response.data;
  },

  updateTags: async (presentationId, tagData) => {
    const response = await axios.put(`${API_BASE_URL}/presentations/${presentationId}/tags`, tagData, {
      headers: authHeaders({ "Content-Type": "application/json" }),
    });
    return response.data;
  },

  deletePresentation: async (id) => {
    await axios.delete(`${API_BASE_URL}/presentations/${id}`, {
      headers: authHeaders(),
    });
    return { message: "Presentation deleted successfully" };
  },
};

export default presentationService;