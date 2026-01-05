import api from './api';

const clienteService = {
    // Vehicles
    getMeusVeiculos: async () => {
        const response = await api.get('/cliente/veiculos');
        return response.data;
    },

    // Insurance Products
    getSegurosDisponiveis: async () => {
        // Assume rota pública ou de seguradora que lista produtos disponíveis
        // Ajustar endpoint conforme backend (usando o SeguradoraSeguros ou Seguros com Precos)
        const response = await api.get('/seguradora/seguros?status=ativo');
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
    contratarSeguro: async (dados) => {
        // dados: { veiculo_id, seguro_id, seguradora_id, preco_id, corretora_id? }
        const response = await api.post('/contratacao/veiculo', dados);
        return response.data;
    },

    // Policies
    getActivePolicies: async () => {
        const response = await api.get('/cliente/apolices/ativas');
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
    }
};

export default clienteService;
