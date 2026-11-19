import api from '@/config/axiosConfig';

const BASE = '/api/v1/wallets';

const WalletService = {
  getAll: () => api.get(BASE),
  getById: (id) => api.get(`${BASE}/${id}`),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),

  getMembers: (walletId) => api.get(`${BASE}/${walletId}/members`),
  addMember: (walletId, data) => api.post(`${BASE}/${walletId}/members`, data),
  updateMemberRole: (walletId, userId, data) =>
    api.patch(`${BASE}/${walletId}/members/${userId}`, data),
  removeMember: (walletId, userId) =>
    api.delete(`${BASE}/${walletId}/members/${userId}`),
};

export default WalletService;
