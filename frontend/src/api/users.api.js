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