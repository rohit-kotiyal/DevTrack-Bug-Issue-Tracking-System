import axios from "./axios"; 

export const getProjectTickets = (projectId, token) => {
  return axios.get(`/tickets/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTicket = (data, token) => {
  return axios.post("/tickets/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateTicket = (ticketId, data, token) => {
  return axios.put(`/tickets/${ticketId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
