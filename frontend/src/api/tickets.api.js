import axios from "axios";

const API_URL = "http://127.0.0.1:8000/tickets";

export const getProjectTickets = (projectId, token) => {
  return axios.get(`${API_URL}/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTicket = (data, token) => {
  return axios.post(`${API_URL}/`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTicket = (ticketId, data, token) => {
  return axios.put(`${API_URL}/${ticketId}`, data, {  
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};