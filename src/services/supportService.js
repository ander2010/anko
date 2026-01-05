import api from "./api";

const BASE = "/support-requests/";

const supportService = {
    /**
     * Sends a support request to the backend.
     * @param {Object} data - The support request data.
     * @param {string} data.name - The name of the user.
     * @param {string} data.phone - The phone number of the user.
     * @param {string} data.message - The message.
     * @param {string} data.source - The source of the request (e.g., "dashboard_home", "contact_page").
     */
    async sendSupportRequest(data) {
        try {
            const res = await api.post(BASE, data);
            return res.data;
        } catch (err) {
            throw err?.response?.data || { error: "Failed to send support request" };
        }
    },
};

export default supportService;
