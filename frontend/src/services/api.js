import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor untuk menyematkan JWT (untuk Staff/Admin) dan Session Token (untuk Pelanggan Meja)
apiClient.interceptors.request.use(
  (config) => {
    // 1. JWT Token (Staff/Admin)
    const jwtToken = localStorage.getItem('honeycake_jwt');
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
    }

    // 2. Table Session Token (Pelanggan)
    const sessionToken = localStorage.getItem('honeycake_table_token');
    if (sessionToken) {
      config.headers['x-session-token'] = sessionToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response untuk penanganan error seragam
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan saat berkomunikasi dengan server.';
    return Promise.reject(new Error(errorMsg));
  }
);

export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/me')
};

export const tableApi = {
  generateQR: (tableNumber) => apiClient.post('/tables/generate-qr', { tableNumber }),
  getSessionByToken: (token) => apiClient.get(`/tables/session/${token}`),
  requestBill: (paymentMethod, sessionToken) =>
    apiClient.post(
      '/tables/request-bill',
      { paymentMethod },
      sessionToken ? { headers: { 'x-session-token': sessionToken } } : {}
    ),
  closeSession: (id) => apiClient.patch(`/tables/close-session/${id}`),
  getActiveSessions: () => apiClient.get('/tables/active')
};

export const menuApi = {
  getAllMenus: (params) => apiClient.get('/menus', { params }),
  getMenuById: (id) => apiClient.get(`/menus/${id}`),
  createMenu: (data) => apiClient.post('/menus', data),
  updateMenu: (id, data) => apiClient.put(`/menus/${id}`, data),
  deleteMenu: (id) => apiClient.delete(`/menus/${id}`)
};

export const orderApi = {
  createOrder: (orderItems, sessionToken) =>
    apiClient.post(
      '/orders',
      { orderItems },
      sessionToken ? { headers: { 'x-session-token': sessionToken } } : {}
    ),
  getOrdersByTableToken: (token) =>
    apiClient.get(`/orders/table/${token}`, {
      headers: { 'x-session-token': token }
    }),
  getAllOrders: (params) => apiClient.get('/orders', { params }),
  updateOrderStatus: (id, orderStatus) => apiClient.patch(`/orders/${id}/status`, { orderStatus })
};

export default apiClient;
