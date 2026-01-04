import api, { setAuthToken } from "./api";

const BASE = "/auth/"; // Assuming DRF router registered AuthViewSet at /api/auth/

const authService = {
  async login({ username, password }) {
    try {
      const res = await api.post(`${BASE}login/`, { username, password });
      console.log("LOGIN RAW DATA:", res.data);

      const { token, user } = res.data;
      console.log("TOKEN:", token);
      if (token) setAuthToken(token);
      return { token, user };
    } catch (err) {
      throw err?.response?.data || { error: "Login failed" };
    }
  },

  async register({ username, email, password }) {
    try {
      const payload = { username, password };
      if (email) payload.email = email;
      const res = await api.post(`${BASE}register/`, payload);
      const { token, user } = res.data;
      if (token) setAuthToken(token);
      return { token, user };
    } catch (err) {
      throw err?.response?.data || { error: "Register failed" };
    }
  },

  async me() {
    try {
      const res = await api.get(`${BASE}me/`);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Unable to fetch user" };
    }
  },

  async updateProfile(data) {
    try {
      const res = await api.patch(`${BASE}me/`, data);
      return res.data;
    } catch (err) {
      throw err?.response?.data || { error: "Update profile failed" };
    }
  },

  logout() {
    setAuthToken(null);
  },
};

export default authService;
