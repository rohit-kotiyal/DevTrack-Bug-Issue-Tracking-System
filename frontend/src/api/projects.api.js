import axios from "axios";

const API_URL = "http://127.0.0.1:8000/projects/";

/* ✅ LIST MY PROJECTS */
export const getProjects = async (token) => {
  return axios.get(API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ✅ CREATE PROJECT */
export const createProject = async (data, token) => {
  return axios.post(API_URL, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ✅ GET SINGLE PROJECT */
export const getProject = async (projectId, token) => {
  return axios.get(`${API_URL}${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* LIST PROJECT MEMBERS (GET) */
export const getProjectMembers = async (projectId, token) => {
  return axios.get(
    `http://127.0.0.1:8000/projects/${projectId}/member`, // singular
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

/* ADD PROJECT MEMBER (POST) */
export const addProjectMember = async (projectId, data, token) => {
  return axios.post(
    `http://127.0.0.1:8000/projects/${projectId}/member`, // ✅ Changed to singular
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};


/* DELETE PROJECT (ADMIN ONLY) */
export const deleteProject = async (projectId, token) => {
  return axios.delete(`${API_URL}${projectId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
