import axios from "axios";

// Separate axios instance pointing at the independently-deployed review
// service (its own URL, its own deploy) — NOT the main backend's api.ts
// instance. Reuses the same stored token since both services trust the
// same JWT_SECRET.
const reviewApi = axios.create({
  baseURL: import.meta.env.VITE_REVIEW_SERVICE_URL || "http://localhost:5001/api",
});

reviewApi.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    const user = JSON.parse(storedUser);
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  }
  return config;
});

export default reviewApi;
