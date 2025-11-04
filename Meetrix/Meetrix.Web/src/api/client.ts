import axios from "axios";

const api = axios.create({
  baseURL: "https://localhost:7215/api",
});

// Attach JWT from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("meetrix_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
