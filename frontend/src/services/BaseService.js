import api from '@/config/axiosConfig';

class BaseService {
  constructor(endPoint) {
    this.endPoint = endPoint;
    this.api = api;
  }

  async create(data) {
    return this.api.post(this.endPoint, data);
  }

  async getAll() {
    return this.api.get(this.endPoint);
  }

  async getById(id) {
    return this.api.get(`${this.endPoint}/${id}`);
  }

  async update(id, data) {
    return this.api.put(`${this.endPoint}/${id}`, data);
  }

  async delete(id) {
    return this.api.delete(`${this.endPoint}/${id}`);
  }
}

export default BaseService;
