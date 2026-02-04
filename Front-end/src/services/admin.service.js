import api from './api';

const AdminService = {
    getDashboardStats: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    },

    getSeguradoras: async (params) => {
        const response = await api.get('/admin/seguradoras', { params });
        return response.data;
    },

    toggleSeguradoraStatus: async (id) => {
        const response = await api.post(`/admin/seguradoras/${id}/toggle-status`);
        return response.data;
    },

    getUsers: async (params) => {
        const response = await api.get('/admin/users', { params });
        return response.data;
    },

    createSeguradora: async (data) => {
        const response = await api.post('/admin/seguradoras', data);
        return response.data;
    },

    createUser: async (data) => {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    // Governance
    getGovernanceUsers: async (page = 1) => {
        const response = await api.get(`/governance/users?page=${page}`);
        return response.data;
    },

    toggleUserStatus: async (id) => {
        const response = await api.post(`/governance/users/${id}/toggle-status`);
        return response.data;
    },

    getSettings: async () => {
        const response = await api.get('/governance/settings');
        return response.data;
    },

    updateSetting: async (key, value) => {
        const response = await api.post('/governance/settings', { key, value });
        return response.data;
    },

    getAuditLogs: async (page = 1) => {
        const response = await api.get(`/governance/audit-logs?page=${page}`);
        return response.data;
    }
};

export default AdminService;
