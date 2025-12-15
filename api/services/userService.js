import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/users`;


export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

export const loginUser = async (userData) => {
  const response = await axios.post(`${API_URL}/login`, userData);
  return response.data;
};

export const followUser = async (targetId, currentUserId) => {
  return axios.post(`${API_URL}/${targetId}/follow`, { userId: currentUserId });
};

export const unfollowUser = async (targetId, currentUserId) => {
  return axios.post(`${API_URL}/${targetId}/unfollow`, { userId: currentUserId });
};
