import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("jwToken");
  if (token) {
    config.headers.token = token;
  }
  return config;
});

export default api;
