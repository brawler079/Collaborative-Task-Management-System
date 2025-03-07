import axios from "axios";

const API_URL = "http://localhost:5004/api/users"; 

// Register User
export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

// Login User
export const loginUser = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  return res.data;
};

// Logout 
export const logoutUser = () => {
  localStorage.removeItem("token");
};

// Get logged-in user
export const getUser = () => {
  return localStorage.getItem("token");
};
