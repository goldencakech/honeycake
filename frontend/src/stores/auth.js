import { defineStore } from 'pinia';
import { authApi } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('honeycake_jwt') || null,
    user: JSON.parse(localStorage.getItem('honeycake_user') || 'null'),
    isLoading: false,
    errorMessage: ''
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(email, password) {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const response = await authApi.login({ email, password });
        if (response.success && response.token) {
          this.token = response.token;
          this.user = response.user;
          localStorage.setItem('honeycake_jwt', response.token);
          localStorage.setItem('honeycake_user', JSON.stringify(response.user));
          return response;
        }
        throw new Error(response.message || 'Login gagal.');
      } catch (err) {
        this.errorMessage = err.message || 'Terjadi kesalahan saat login.';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('honeycake_jwt');
      localStorage.removeItem('honeycake_user');
    }
  }
});
