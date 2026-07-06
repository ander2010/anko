// src/services/rbacService.js
import api from "./api";

export async function fetchAllowedRoutes() {
    try {
        const res = await api.get("/rbac/me/allowed-routes/");
        return res.data;
    } catch (err) {
        console.error("RBAC fetch failed", err);
        throw err?.response?.data || { error: "Failed to fetch RBAC data" };
    }
}

export async function fetchRolePermissions(role) {
    const keys = new Set();
    let url = `/api/permissions/?role=${encodeURIComponent(role)}`;
    while (url) {
        const res = await api.get(url);
        const data = res.data;
        (data.results || []).forEach((p) => keys.add(p.resourceKey));
        if (data.next) {
            try {
                const u = new URL(data.next);
                url = u.pathname + u.search;
            } catch {
                url = null;
            }
        } else {
            url = null;
        }
    }
    return keys;
}

const rbacService = {
    fetchAllowedRoutes,
    fetchRolePermissions,
};

export default rbacService;
