<template>
  <header class="glass-nav">
    <div class="nav-container">
      <!-- Brand Logo -->
      <router-link to="/" class="nav-brand">
        <span class="brand-icon">🍯</span>
        <div class="brand-text-wrap">
          <span class="brand-title">HoneyCake</span>
          <span class="brand-sub">Smart Café</span>
        </div>
      </router-link>

      <!-- Customer View Header Actions -->
      <div v-if="!isStaffArea" class="nav-customer-actions">
        <div v-if="customerSessionStore.tableNumber" class="table-pill">
          <span class="dot-indicator" :class="{ 'dot-active': customerSessionStore.isSessionActive }"></span>
          <span>Meja #{{ customerSessionStore.tableNumber }}</span>
        </div>

        <button
          v-if="customerSessionStore.tableNumber && customerSessionStore.canOrder"
          class="btn btn-secondary btn-sm"
          @click="$emit('open-request-bill')"
        >
          <span>Minta Tagihan</span>
        </button>

        <router-link to="/staff/login" class="staff-link" title="Masuk ke Dashboard Staf/Admin">
          <span>Staf</span>
        </router-link>
      </div>

      <!-- Staff View Header Actions -->
      <div v-else class="nav-staff-actions">
        <nav class="staff-nav-links">
          <router-link to="/staff/tables" class="staff-nav-item">
            <span>🪑 Meja & QR</span>
          </router-link>
          <router-link to="/staff/orders" class="staff-nav-item">
            <span>🍳 Dapur (Kanban)</span>
          </router-link>
          <router-link to="/staff/cashier" class="staff-nav-item">
            <span>💳 Kasir</span>
          </router-link>
          <router-link v-if="authStore.isAdmin" to="/staff/menus" class="staff-nav-item">
            <span>🍰 Menu Admin</span>
          </router-link>
        </nav>

        <div class="staff-user-controls">
          <div class="user-badge" v-if="authStore.user">
            <span class="user-name">{{ authStore.user.name }}</span>
            <span class="role-tag">{{ authStore.user.role }}</span>
          </div>

          <button class="btn btn-outline btn-sm" @click="handleLogout" title="Logout">
            <span>Keluar</span>
          </button>

          <router-link to="/" class="customer-preview-btn btn btn-secondary btn-sm" title="Kembali ke Tampilan Pelanggan">
            <span>Mode Tamu</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCustomerSessionStore } from '../../stores/customerSession';
import { useAuthStore } from '../../stores/auth';

defineEmits(['open-request-bill']);

const route = useRoute();
const router = useRouter();
const customerSessionStore = useCustomerSessionStore();
const authStore = useAuthStore();

const isStaffArea = computed(() => {
  return route.path.startsWith('/staff') && route.path !== '/staff/login';
});

const handleLogout = () => {
  authStore.logout();
  router.push('/staff/login');
};
</script>

<style scoped>
.glass-nav {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  padding: 10px 18px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1360px;
  margin: 0 auto;
  gap: 12px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text-main);
}

.brand-icon {
  font-size: 1.8rem;
  line-height: 1;
}

.brand-text-wrap {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--honey-dark);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 0.675rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--honey-primary);
}

/* Customer Actions */
.nav-customer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.table-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-muted);
  border: 1px solid var(--border-subtle);
  padding: 5px 12px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-main);
}

.dot-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.dot-indicator.dot-active {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.staff-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-muted);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s;
}

.staff-link:hover {
  background: var(--honey-primary-light);
  color: var(--honey-dark);
}

/* Staff Actions */
.nav-staff-actions {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  justify-content: space-between;
}

.staff-nav-links {
  display: flex;
  gap: 8px;
  margin-left: 20px;
}

.staff-nav-item {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.staff-nav-item:hover,
.staff-nav-item.router-link-active {
  color: var(--honey-dark);
  background: var(--honey-primary-light);
}

.staff-user-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  font-size: 0.825rem;
  font-weight: 700;
  color: var(--text-main);
}

.role-tag {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--honey-primary);
}

@media (max-width: 840px) {
  .staff-nav-links {
    display: none;
  }
}
</style>
