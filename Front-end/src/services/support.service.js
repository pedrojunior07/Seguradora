import api from './api';

const supportService = {
    send: async (data) => {
        const response = await api.post('/support/send', data);
        return response.data;
    }
};

export default supportService;
