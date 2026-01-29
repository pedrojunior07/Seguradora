import api from './api';

const agenteService = {
    listar: () => api.get('/seguradora/agentes'),
    criar: (dados) => api.post('/seguradora/agentes', dados),
    atualizar: (id, dados) => api.put(`/seguradora/agentes/${id}`, dados),
    excluir: (id) => api.delete(`/seguradora/agentes/${id}`),
};

export default agenteService;
