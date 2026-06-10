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

    // Parcerias com Seguradoras
    getParceiras: async () => {
        const response = await api.get('/corretora/parceiras');
        return response.data;
    },

    getSeguradoresDisponiveis: async () => {
        const response = await api.get('/corretora/seguradoras-disponiveis');
        return response.data;
    },

    solicitarParceria: async (seguradoraId) => {
        const response = await api.post(`/corretora/seguradoras/${seguradoraId}/solicitar`);
        return response.data;
    },

    cancelarParceria: async (parceiraId) => {
        const response = await api.delete(`/corretora/parceiras/${parceiraId}`);
        return response.data;
    },

    // Perfil e Verificação
    getVerificacaoStatus: async () => {
        const response = await api.get('/corretora/perfil/verificacao');
        return response.data;
    },

    uploadDocumentos: async (formData) => {
        const response = await api.post('/corretora/perfil/verificacao', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default corretoraService;
