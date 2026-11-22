import api from '@/config/axiosConfig';

const ReportService = {
  getStatement: (walletId, params = {}) =>
    api.get(`/api/v1/wallets/${walletId}/reports/statement`, { params }),
  exportCsv: (walletId, params = {}) =>
    api.get(`/api/v1/wallets/${walletId}/reports/export/csv`, {
      params,
      responseType: 'blob',
    }),
};

export default ReportService;
