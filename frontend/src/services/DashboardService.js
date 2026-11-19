import api from '@/config/axiosConfig';

const DashboardService = {
  getSummary: (walletId, params = {}) =>
    api.get(`/api/v1/wallets/${walletId}/summary`, { params }),
};

export default DashboardService;
