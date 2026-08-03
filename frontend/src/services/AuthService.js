import BaseService from "./BaseService";

class AuthService extends BaseService {
    constructor() {
        super("/auth");
    }

    async login(credentials) {
        return this.api.post(`${this.endPoint}/login`, credentials);
    }

    async forgotPassword(email) {
        return this.api.post(`${this.endPoint}/forgot-password`, { email });
    }

    async resetPassword(token, newPassword) {
        return this.api.post(`${this.endPoint}/reset-password`, { token, newPassword });
    }
}

export default AuthService;
