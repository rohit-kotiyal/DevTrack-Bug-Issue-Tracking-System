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
export const getProjectTickets = (projectId, token, params = {}) => {
  return axios.get(`/tickets/project/${projectId}`, {  // ✅ Correct route
    params,  // ✅ Includes search, status_filter, priority
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

// Delete a ticket
export const deleteTicket = (ticketId, token) => {
  return axios.delete(`/tickets/${ticketId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get all tickets
export const getTickets = (token) => {
  return axios.get("/tickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Get a single ticket by ID
export const getTicket = (ticketId, token) => {
  return axios.get(`/tickets/${ticketId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};