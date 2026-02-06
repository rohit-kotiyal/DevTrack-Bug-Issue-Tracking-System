import axios from "./axios";  

export const registerUser = async (userData) => {
  return axios.post("/auth/register", userData);  
};

export const loginUser = async (credentials) => {
  return axios.post("/auth/login", credentials); 
};

export const getCurrentUser = async (token) => {
  return axios.get("/auth/me", {  
    headers: { Authorization: `Bearer ${token}` },
  });
};


export const login = loginUser;
export const register = registerUser;