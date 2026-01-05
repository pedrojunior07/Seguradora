import api from './api';

const userService = {
    // Listar operadores da equipe
    listarOperadores: async (params) => {
        try {
            const response = await api.get('/equipe', { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Criar novo operador
    criarOperador: async (dados) => {
        try {
            const response = await api.post('/equipe/operadores', dados);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Atualizar operador
    atualizarOperador: async (id, dados) => {
        try {
            const response = await api.put(`/equipe/${id}`, dados);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Excluir operador
    excluirOperador: async (id) => {
        try {
            const response = await api.delete(`/equipe/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
