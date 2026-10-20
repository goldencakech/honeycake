import { defineStore } from 'pinia';
import { tableApi } from '../services/api';

export const useCustomerSessionStore = defineStore('customerSession', {
  state: () => ({
    token: localStorage.getItem('honeycake_table_token') || '',
    session: null,
    tableNumber: null,
    status: 'ACTIVE', // 'ACTIVE' | 'BILL_REQUESTED' | 'CLOSED'
    paymentMethod: null,
    totalBill: 0,
    isLoading: false,
    errorMessage: ''
  }),

  getters: {
    isSessionActive: (state) => state.status === 'ACTIVE',
    isBillRequested: (state) => state.status === 'BILL_REQUESTED',
    isSessionClosed: (state) => state.status === 'CLOSED',
    canOrder: (state) => state.status === 'ACTIVE'
  },

  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('honeycake_table_token', token);
    },

    clearSession() {
      this.token = '';
      this.session = null;
      this.tableNumber = null;
      this.status = 'ACTIVE';
      this.paymentMethod = null;
      this.totalBill = 0;
      localStorage.removeItem('honeycake_table_token');
    },

    async fetchSession(tokenToFetch) {
      const activeToken = tokenToFetch || this.token;
      if (!activeToken) return false;

      this.isLoading = true;
      this.errorMessage = '';

      try {
        const response = await tableApi.getSessionByToken(activeToken);
        if (response.success && response.session) {
          this.setToken(activeToken);
          this.session = response.session;
          this.tableNumber = response.session.tableNumber;
          this.status = response.session.status;
          this.paymentMethod = response.session.paymentMethod;
          this.totalBill = response.session.totalBill || 0;
          return true;
        }
        return false;
      } catch (err) {
        this.errorMessage = err.message || 'Gagal memuat sesi meja.';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async requestBill(method) {
      if (!this.token) throw new Error('Token sesi tidak ditemukan.');
      this.isLoading = true;
      try {
        const response = await tableApi.requestBill(method, this.token);
        if (response.success && response.session) {
          this.status = response.session.status;
          this.paymentMethod = response.session.paymentMethod;
          this.totalBill = response.session.totalBill || this.totalBill;
          return response;
        }
        throw new Error(response.message || 'Gagal meminta tagihan.');
      } finally {
        this.isLoading = false;
      }
    }
  }
});
