import api from './api';

const seguradoraService = {
    // Policies Management
    getPendingPolicies: async () => {
        const response = await api.get('/seguradora/apolices/pendentes');
        return response.data;
    },

    getActivePolicies: async () => {
        const response = await api.get('/seguradora/apolices/ativas');
        return response.data;
    },

    getPolicy: async (apoliceId) => {
        const response = await api.get(`/seguradora/apolices/${apoliceId}`);
        return response.data;
    },

    approvePolicy: async (apoliceId, observacoes = '') => {
        const response = await api.post(`/seguradora/apolices/${apoliceId}/aprovar`, {
            observacoes,
        });
        return response.data;
    },

    rejectPolicy: async (apoliceId, motivo) => {
        const response = await api.post(`/seguradora/apolices/${apoliceId}/rejeitar`, {
            motivo,
        });
        return response.data;
    },

    // Claims Management
    getPendingClaims: async () => {
        const response = await api.get('/seguradora/sinistros/pendentes');
        return response.data;
    },

    getClaim: async (sinistroId) => {
        const response = await api.get(`/seguradora/sinistros/${sinistroId}`);
        return response.data;
    },

    analyzeClaim: async (sinistroId, observacoes = '') => {
        const response = await api.post(`/seguradora/sinistros/${sinistroId}/analisar`, {
            observacoes,
        });
        return response.data;
    },

    approveClaim: async (sinistroId, data) => {
        const response = await api.post(`/seguradora/sinistros/${sinistroId}/aprovar`, data);
        return response.data;
    },
};

export default seguradoraService;
