import BaseService from "./BaseService";

class UserService extends BaseService {
    constructor() {
        super("/api/users");
    }

    async create(data) {
        return this.api.post(this.endPoint, data);
    }

    async getProfile() {
        return this.api.get(`${this.endPoint}/me`);
    }

    async updateProfile(data) {
        return this.api.put(`${this.endPoint}/me`, data);
    }

    async changePassword(idOrData, maybeData) {
        const data = maybeData || idOrData;
        return this.api.patch(`${this.endPoint}/me/password`, {
            currentPassword: data.oldPassword || data.currentPassword,
            newPassword: data.newPassword,
        });
    }
}

export default UserService;
