import api from './api';

const corretoraService = {
    // Proposals Management
    getProposals: async () => {
        const response = await api.get('/corretora/propostas');
        return response.data;
    },

    createProposal: async (data) => {
        const response = await api.post('/corretora/propostas', data);
        return response.data;
    },

    getProposal: async (propostaId) => {
        const response = await api.get(`/corretora/propostas/${propostaId}`);
        return response.data;
    },

    sendProposal: async (propostaId) => {
        const response = await api.post(`/corretora/propostas/${propostaId}/enviar`);
        return response.data;
    },

    convertToPolicy: async (propostaId) => {
        const response = await api.post(`/corretora/propostas/${propostaId}/converter-apolice`);
        return response.data;
    },
};

export default corretoraService;
