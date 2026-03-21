import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const defaultVoices = ["en-US-JennyNeural"];

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : "";
      if (!base64) {
        reject(new Error("Invalid audio base64 data"));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Cannot read audio blob"));
    reader.readAsDataURL(blob);
  });


const normalizeBackendTtsResponseToBase64 = async (responseData) => {
  if (typeof responseData === "string") {
    const trimmed = responseData.trim();
    if (!trimmed) {
      throw new Error("Empty TTS response");
    }

    if (/^https?:\/\//i.test(trimmed)) {
      const fetched = await fetch(trimmed);
      if (!fetched.ok) {
        throw new Error(`Cannot fetch backend audio (${fetched.status})`);
      }
      return blobToBase64(await fetched.blob());
    }

    if (trimmed.startsWith("data:")) {
      const base64 = trimmed.split(",")[1];
      if (!base64) {
        throw new Error("Invalid backend data URL");
      }
      return base64;
    }

    return trimmed;
  }

  if (responseData && typeof responseData === "object") {
    const candidate =
      responseData.audioData || responseData.url || responseData.audio_url || responseData.audioUrl;
    return normalizeBackendTtsResponseToBase64(candidate);
  }

  throw new Error("Unsupported backend TTS response format");
};

const homeWorkService = {
  getAllHomeWork: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeWork list";
    }
  },
  getHomeWorkById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks";
    }
  },

  reassignTeacherForHomeWorks: async (reassignData) => {
    // reassignData sẽ có dạng { oldTeacherId, newTeacherId }
    try {
      const response = await axios.put(`${API_BASE_URL}/homeworks/reassign-teacher`, reassignData, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data; // Trả về { message, updatedCount }
    } catch (error) {
      throw error.response?.data?.message || "Error reassigning homeworks";
    }
  },

  getHomeWorkByLevelAndTeacherId: async (levelAndTeacherId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/homeworks/level`, levelAndTeacherId, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks list";
    }
  },
  getHomeWorkByTeacherId: async (TeacherId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks/teacher/${TeacherId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching homeworks list";
    }
  },
  createHomeWork: async (homeWorkData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/homeworks`, homeWorkData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating homeWork";
    }
  },

  editHomeWork: async (id, homeWorkData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/homeworks/${id}`, homeWorkData, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating homeWork";
    }
  },
  deleteHomeWork: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/homeworks/${id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      return { message: "HomeWork deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting homework";
    }
  },
  textToSpeech: async ({ textToSpeech, voice }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/homeworks/textToSpeech`,
        {
          textToSpeech,
          voice,
        },
        {
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      // console.log(response);
      return await normalizeBackendTtsResponseToBase64(response.data);
    } catch (error) {
      throw error.response?.data?.message || "Text to speech failed";
    }
  },
  voices: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/homeworks/textToSpeech/voices`);
      // console.log(response);

      return response.data;
    } catch (error) {
      return defaultVoices;
    }
  },
};
export default homeWorkService;
