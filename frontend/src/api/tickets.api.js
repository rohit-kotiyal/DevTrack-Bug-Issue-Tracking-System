import axios from "./axios";

export const getProjectMembers = (projectId, token) => {
  return axios.get(`/projects/${projectId}/member`, {  
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getCurrentUser = (token) => {
  return axios.get(`/auth/me`, {  
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get all tickets for a specific project
export const getProjectTickets = (projectId, token) => {
  return axios.get(`/projects/${projectId}/tickets`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createTicket = (ticketData, token) => {
  return axios.post("/tickets", ticketData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Update an existing ticket
export const updateTicket = (ticketId, ticketData, token) => {
  return axios.put(`/tickets/${ticketId}`, ticketData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Other ticket API calls (if any)
export const getTickets = (token) => {
  return axios.get("/tickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
