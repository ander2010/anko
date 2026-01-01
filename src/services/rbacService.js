// src/services/rbacService.js
import api from "./api";

/**
 * Fetches allowed routes and user permissions from the backend.
 * Returns { allowed_routes: [...], is_admin, roles, etc. }
 */
export async function fetchAllowedRoutes() {
    try {
        const res = await api.get("/rbac/me/allowed-routes/");
        return res.data;
    } catch (err) {
        console.error("RBAC fetch failed", err);
        throw err?.response?.data || { error: "Failed to fetch RBAC data" };
    }
}

const rbacService = {
    fetchAllowedRoutes,
};

export default rbacService;
