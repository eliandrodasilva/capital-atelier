import api from '@/config/axiosConfig';

const TransactionService = {
  list: (walletId, params = {}) =>
    api.get(`/api/v1/wallets/${walletId}/transactions`, { params }),
  getById: (walletId, id) =>
    api.get(`/api/v1/wallets/${walletId}/transactions/${id}`),
  create: (walletId, data) =>
    api.post(`/api/v1/wallets/${walletId}/transactions`, data),
  update: (walletId, id, data) =>
    api.put(`/api/v1/wallets/${walletId}/transactions/${id}`, data),
  delete: (walletId, id) =>
    api.delete(`/api/v1/wallets/${walletId}/transactions/${id}`),
};

export default TransactionService;
