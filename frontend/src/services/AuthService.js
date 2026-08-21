import BaseService from "./BaseService";

class AuthService extends BaseService {
    constructor() {
        super("/auth");
    }

    async register(userData) {
        return this.api.post(`${this.endPoint}/register`, {
            name: userData.username || userData.name,
            email: userData.email,
            password: userData.password,
        });
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
