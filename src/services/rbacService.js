// src/services/rbacService.js
import api from "./api";

export async function fetchAllowedRoutes(companyId) {
    try {
        const params = companyId ? { company_id: companyId } : {};
        const res = await api.get("/rbac/me/allowed-routes/", { params });
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
