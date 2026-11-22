import api from '@/config/axiosConfig';

const AiService = {
  generateInsights: (walletId, data = {}) =>
    api.post(`/api/v1/wallets/${walletId}/ai/insights`, data),
  suggestCategory: (walletId, data) =>
    api.post(`/api/v1/wallets/${walletId}/ai/categorize`, data),
};

export default AiService;
