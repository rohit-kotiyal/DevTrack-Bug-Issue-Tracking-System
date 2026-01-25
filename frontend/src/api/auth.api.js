import axios from "axios";

const API_URL = "http://127.0.0.1:8000/auth"; 

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

export const getCurrentUser = async (token) => {
  return axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
