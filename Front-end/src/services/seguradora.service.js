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

    // Propostas
    getPropostas: async (params) => {
        const response = await api.get('/seguradora/propostas', { params });
        return response.data;
    },

    getProposta: async (id) => {
        const response = await api.get(`/seguradora/propostas/${id}`);
        return response.data;
    },

    aprovarProposta: async (id) => {
        const response = await api.post(`/seguradora/propostas/${id}/aprovar`);
        return response.data;
    },

    rejeitarProposta: async (id, motivo) => {
        const response = await api.post(`/seguradora/propostas/${id}/rejeitar`, { motivo });
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

    // Pagamentos (Fictício)
    confirmarPagamento: async (id) => {
        const response = await api.post(`/cliente/pagamentos/${id}/confirmar-ficticio`);
        return response.data;
    },

    // Parcerias com Corretoras
    getParceiras: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get('/seguradora/parceiras', { params });
        return response.data;
    },

    aprovarParceria: async (id, comissao_percentagem) => {
        const response = await api.post(`/seguradora/parceiras/${id}/aprovar`, { comissao_percentagem });
        return response.data;
    },

    rejeitarParceria: async (id, observacoes) => {
        const response = await api.post(`/seguradora/parceiras/${id}/rejeitar`, { observacoes });
        return response.data;
    },

    revogarParceria: async (id) => {
        const response = await api.post(`/seguradora/parceiras/${id}/revogar`);
        return response.data;
    },

    getParceiriaSeguros: async (id) => {
        const response = await api.get(`/seguradora/parceiras/${id}/seguros`);
        return response.data;
    },

    // Perfil e Verificação
    getVerificacaoStatus: async () => {
        const response = await api.get('/seguradora/perfil/verificacao');
        return response.data;
    },

    uploadDocumentos: async (formData) => {
        const response = await api.post('/seguradora/perfil/verificacao', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

export default seguradoraService;
