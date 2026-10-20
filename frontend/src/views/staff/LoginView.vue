<template>
  <div class="login-wrapper">
    <div class="login-box card">
      <div class="login-header">
        <span class="logo-honey">🍯</span>
        <h1 class="login-title">HoneyCake Staff Portal</h1>
        <p class="login-subtitle">Masuk untuk mengelola QR meja, dapur, kasir, dan menu.</p>
      </div>

      <div v-if="errorMessage" class="error-banner">
        ⚠️ {{ errorMessage }}
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label class="form-label" for="staff-email">Alamat Email:</label>
          <input
            id="staff-email"
            v-model="email"
            type="email"
            class="form-control"
            placeholder="admin@honeycake.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="staff-password">Kata Sandi (Password):</label>
          <input
            id="staff-password"
            v-model="password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            required
          />
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
          <span v-if="isLoading">Memverifikasi...</span>
          <span v-else>Masuk ke Dashboard</span>
        </button>
      </form>

      <!-- Quick Demo Login Helpers -->
      <div class="quick-demo-accounts">
        <span class="demo-tag">Akun Demo Cepat:</span>
        <div class="demo-account-buttons">
          <button
            type="button"
            class="btn btn-outline btn-sm"
            @click="fillDemo('admin@honeycake.com', 'admin123')"
          >
            Manager (Admin)
          </button>
          <button
            type="button"
            class="btn btn-outline btn-sm"
            @click="fillDemo('staff@honeycake.com', 'staff123')"
          >
            Barista (Staff)
          </button>
        </div>
      </div>

      <div class="back-link-box">
        <router-link to="/" class="back-home-link">&larr; Kembali ke Tampilan Pelanggan</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('admin@honeycake.com');
const password = ref('admin123');
const isLoading = ref(false);
const errorMessage = ref('');

const fillDemo = (demoEmail, demoPass) => {
  email.value = demoEmail;
  password.value = demoPass;
};

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/staff/tables');
  } catch (err) {
    errorMessage.value = err.message || 'Kombinasi email atau password salah.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: radial-gradient(circle at top right, #fef3c7 0%, #fcf9f2 60%);
}

.login-box {
  max-width: 420px;
  width: 100%;
  padding: 32px 28px;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-lg);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.logo-honey {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
}

.login-title {
  font-size: 1.45rem;
  margin-bottom: 6px;
  color: var(--honey-dark);
}

.login-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.error-banner {
  background: #fee2e2;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  margin-bottom: 16px;
  border: 1px solid #fca5a5;
}

.login-form {
  margin-bottom: 20px;
}

.quick-demo-accounts {
  background: var(--bg-muted);
  padding: 14px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  text-align: center;
}

.demo-tag {
  font-size: 0.775rem;
  color: var(--text-muted);
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

.demo-account-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.back-link-box {
  text-align: center;
}

.back-home-link {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  font-weight: 600;
}

.back-home-link:hover {
  color: var(--honey-primary);
}
</style>
