import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const classTestScheduleSerivce = {
  getAllClassTestSchedule: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/classTestSchedule`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error fetching class test schedule list";
    }
  },

  createClassTestSchedule: async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/classTestSchedule`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error creating Class test schedule ";
    }
  },

  editClassTestSchedule: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/classTestSchedule/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Error updating class test schedule";
    }
  },

  deleteClassTestSchedule: async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/classTestSchedule/${id}`);
      return { message: "Test deleted successfully" };
    } catch (error) {
      throw error.response?.data?.message || "Error deleting class test schedule";
    }
  },
};

export default classTestScheduleSerivce;
