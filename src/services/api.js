import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000/api";
// SSE_BASE targets the dedicated progress service (port 3020)
export const SSE_BASE = import.meta.env.VITE_SSE_URL || (API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1') ? "http://localhost:3020" : "/companion");
// export const API_BASE = import.meta.env.VITE_API_BASE || "https://italk2.me/api";



const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});





export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Token ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
}

// Initialize token from localStorage if present
const savedToken = localStorage.getItem("token");
if (savedToken) setAuthToken(savedToken);

export default api;
