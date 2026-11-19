import api from '@/config/axiosConfig';

const BASE = '/api/v1/categories';

const CategoryService = {
  list: (type) => api.get(BASE, { params: type ? { type } : {} }),
  create: (data) => api.post(BASE, data),
  update: (id, data) => api.put(`${BASE}/${id}`, data),
  delete: (id) => api.delete(`${BASE}/${id}`),
};

export default CategoryService;
