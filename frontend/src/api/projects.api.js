import axios from "./axios"; 

/* LIST MY PROJECTS */
export const getProjects = async (token) => {
  return axios.get("/projects/", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* CREATE PROJECT */
export const createProject = async (data, token) => {
  return axios.post("/projects/", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* GET SINGLE PROJECT */
export const getProject = async (projectId, token) => {
  return axios.get(`/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* LIST PROJECT MEMBERS (GET) */
export const getProjectMembers = async (projectId, token) => {
  return axios.get(`/projects/${projectId}/member`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ADD PROJECT MEMBER (POST) */
export const addProjectMember = async (projectId, data, token) => {
  return axios.post(`/projects/${projectId}/member`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* DELETE PROJECT (ADMIN ONLY) */
export const deleteProject = async (projectId, token) => {
  return axios.delete(`/projects/${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};