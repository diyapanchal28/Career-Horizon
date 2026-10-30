// Centralized API URL configuration
// In local development, falls back to "http://localhost:5000/api"
// In production (Vercel), uses VITE_API_URL environment variable

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    return "http://localhost:5000/api";
  }
  const clean = envUrl.trim().replace(/\/+$/, "");
  return clean.endsWith("/api") ? clean : `${clean}/api`;
};

export const API_URL = getApiBaseUrl();
export default API_URL;
