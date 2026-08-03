import api from "@/config/axiosConfig";

class BaseService {
    constructor(endPoint) {
        this.endPoint = endPoint;
        this.api = api;
    }

    async create(data) {
        try {
            const response = await this.api.post(this.endPoint, data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAll() {
        try {
            const response = await this.api.get(this.endPoint);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            const response = await this.api.get(`${this.endPoint}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try {
            const response = await this.api.put(`${this.endPoint}/${id}`, data);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const response = await this.api.delete(`${this.endPoint}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default BaseService;