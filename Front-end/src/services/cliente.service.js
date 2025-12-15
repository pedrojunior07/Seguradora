import api from './api';

const clienteService = {
    // Policies Management
    getPolicies: async () => {
        const response = await api.get('/cliente/apolices');
        return response.data;
    },

    getActivePolicies: async () => {
        const response = await api.get('/cliente/apolices/ativas');
        return response.data;
    },

    getPolicy: async (apoliceId) => {
        const response = await api.get(`/cliente/apolices/${apoliceId}`);
        return response.data;
    },

    getPolicyPayments: async (apoliceId) => {
        const response = await api.get(`/cliente/apolices/${apoliceId}/pagamentos`);
        return response.data;
    },

    // Claims Management
    getClaims: async () => {
        const response = await api.get('/cliente/sinistros');
        return response.data;
    },

    registerClaim: async (data) => {
        const response = await api.post('/cliente/sinistros', data);
        return response.data;
    },

    getClaim: async (sinistroId) => {
        const response = await api.get(`/cliente/sinistros/${sinistroId}`);
        return response.data;
    },

    trackClaim: async (sinistroId) => {
        const response = await api.get(`/cliente/sinistros/${sinistroId}/acompanhamento`);
        return response.data;
    },

    // Payments Management
    getPayments: async () => {
        const response = await api.get('/cliente/pagamentos');
        return response.data;
    },

    getPendingPayments: async () => {
        const response = await api.get('/cliente/pagamentos/pendentes');
        return response.data;
    },

    getOverduePayments: async () => {
        const response = await api.get('/cliente/pagamentos/atrasados');
        return response.data;
    },

    getPayment: async (pagamentoId) => {
        const response = await api.get(`/cliente/pagamentos/${pagamentoId}`);
        return response.data;
    },

    registerPayment: async (pagamentoId, data) => {
        const response = await api.post(`/cliente/pagamentos/${pagamentoId}/registrar`, data);
        return response.data;
    },
};

export default clienteService;
