import api from './api';

const clienteService = {
    // Vehicles
    getMeusVeiculos: async () => {
        const response = await api.get('/cliente/veiculos');
        return response.data;
    },

    addVeiculo: async (dados) => {
        const response = await api.post('/cliente/veiculos', dados);
        return response.data;
    },

    getFotosVeiculo: async (veiculoId) => {
        const response = await api.get(`/cliente/veiculos/${veiculoId}/fotos`);
        return response.data;
    },

    uploadFotoVeiculo: async (veiculoId, data) => {
        const response = await api.post(`/cliente/veiculos/${veiculoId}/fotos`, data);
        return response.data;
    },

    deleteFotoVeiculo: async (veiculoId, fotoId) => {
        const response = await api.delete(`/cliente/veiculos/${veiculoId}/fotos/${fotoId}`);
        return response.data;
    },

    getMinhasPropriedades: async () => {
        const response = await api.get('/cliente/propriedades');
        return response.data;
    },

    // Insurance Products
    getSegurosDisponiveis: async () => {
        const response = await api.get('/public/seguros');
        return response.data;
    },

    // Seguradoras
    getSeguradoras: async () => {
        const response = await api.get('/public/seguradoras');
        return response.data;
    },

    getSegurosDaSeguradora: async (seguradoraId) => {
        const response = await api.get(`/public/seguradoras/${seguradoraId}/seguros`);
        return response.data;
    },

    // Contracting
    simularCotacao: async (dados) => {
        // dados: { id_seguradora_seguro, valor_bem }
        const response = await api.post('/contratacao/simular', dados);
        return response.data;
    },

    contratarSeguro: async (dados) => {
        // dados: FormData para upload de arquivos
        const response = await api.post('/contratacao/contratar', dados, {
            headers: {
                'Content-Type': undefined
            }
        });
        return response.data;
    },

    // Propostas (Novo Fluxo)
    enviarProposta: async (dados) => {
        const response = await api.post('/cliente/propostas', dados);
        return response.data;
    },

    getMinhasPropostas: async () => {
        const response = await api.get('/cliente/propostas');
        return response.data;
    },

    getPropostaById: async (id) => {
        const response = await api.get(`/cliente/propostas/${id}`);
        return response.data;
    },

    // Policies
    getActivePolicies: async () => {
        const response = await api.get('/cliente/apolices/ativas');
        return response.data;
    },

    getApoliceById: async (id) => {
        const response = await api.get(`/cliente/apolices/${id}`);
        return response.data;
    },

    // Claims, Payments (existing)
    getClaims: async () => {
        const response = await api.get('/cliente/sinistros');
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

    confirmarPagamento: async (id) => {
        const response = await api.post(`/cliente/pagamentos/${id}/confirmar-ficticio`);
        return response.data;
    },

    registrarSinistro: async (formData) => {
        const response = await api.post('/cliente/sinistros', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }
};

export default clienteService;
