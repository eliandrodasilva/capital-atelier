import BaseService from "./BaseService";

class UserService extends BaseService {
    constructor() {
        super("/users");
    }

    async updateUser(id, data) {
        return this.update(id, data);
    }

    async changePassword(id, data) {
        return this.api.put(`${this.endPoint}/${id}/change-password`, data);
    }
}

export default UserService;
