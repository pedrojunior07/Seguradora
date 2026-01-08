import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

// Obter token JWT do localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const seguroService = {
  /**
   * Listar todos os seguros da seguradora
   * @param {Object} filtros - Filtros opcionais (status, tipo_seguro, id_categoria, per_page)
   * @returns {Promise} Lista paginada de seguros
   */
  listarSeguros: async (filtros = {}) => {
    try {
      const queryParams = new URLSearchParams(filtros).toString();
      const response = await axios.get(
        `${API_URL}/seguradora/seguros${queryParams ? `?${queryParams}` : ''}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Criar novo seguro
   * @param {Object} dados - Dados do seguro a ser criado
   * @returns {Promise} Seguro criado
   */
  criarSeguro: async (dados) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/seguros`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Obter detalhes de um seguro específico
   * @param {number} id - ID do seguro
   * @returns {Promise} Detalhes do seguro
   */
  obterSeguro: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/seguradora/seguros/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar informações do seguro
   * @param {number} id - ID do seguro
   * @param {Object} dados - Dados atualizados
   * @returns {Promise} Seguro atualizado
   */
  atualizarSeguro: async (id, dados) => {
    try {
      const response = await axios.put(
        `${API_URL}/seguradora/seguros/${id}`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Ativar seguro
   * @param {number} id - ID do seguro
   * @returns {Promise} Seguro ativado
   */
  ativarSeguro: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/seguros/${id}/ativar`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Desativar seguro
   * @param {number} id - ID do seguro
   * @returns {Promise} Seguro desativado
   */
  desativarSeguro: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/seguros/${id}/desativar`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Adicionar novo preço ao seguro
   * @param {number} id - ID do seguro
   * @param {Object} dados - Dados do preço
   * @returns {Promise} Preço criado
   */
  adicionarPreco: async (id, dados) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/seguros/${id}/precos`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  ativarPreco: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/precos/${id}/ativar`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  desativarPreco: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/precos/${id}/desativar`,
        {},
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Adicionar cobertura ao seguro
   * @param {number} id - ID do seguro
   * @param {Object} dados - Dados da cobertura
   * @returns {Promise} Cobertura criada
   */
  adicionarCobertura: async (id, dados) => {
    try {
      const response = await axios.post(
        `${API_URL}/seguradora/seguros/${id}/coberturas`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Listar todas as categorias disponíveis
   * @returns {Promise} Lista de categorias
   */
  listarCategorias: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/categorias`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Criar nova categoria
   * @param {Object} dados - { descricao: string }
   * @returns {Promise} Categoria criada
   */
  criarCategoria: async (dados) => {
    try {
      const response = await axios.post(
        `${API_URL}/categorias`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Atualizar categoria existing
   * @param {number} id - ID da categoria
   * @param {Object} dados - { descricao: string }
   * @returns {Promise} Categoria atualizada
   */
  atualizarCategoria: async (id, dados) => {
    try {
      const response = await axios.put(
        `${API_URL}/categorias/${id}`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Excluir categoria
   * @param {number} id - ID da categoria
   * @returns {Promise} Mensagem de sucesso
   */
  excluirCategoria: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/categorias/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // --- Tipos de Seguro ---

  criarTipo: async (dados) => {
    try {
      const response = await axios.post(
        `${API_URL}/tipos-seguro`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  atualizarTipo: async (id, dados) => {
    try {
      const response = await axios.put(
        `${API_URL}/tipos-seguro/${id}`,
        dados,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  excluirTipo: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/tipos-seguro/${id}`,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default seguroService;
