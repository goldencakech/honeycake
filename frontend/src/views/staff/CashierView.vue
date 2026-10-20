<template>
  <div class="dashboard-viewport">
    <Navbar />

    <div class="cashier-page-header">
      <div>
        <h1 class="page-title">Kasir & Sesi Meja (Cashier Desk)</h1>
        <p class="page-subtitle">Pantau permintaan tagihan pelanggan, periksa rincian pesanan, dan tutup sesi meja setelah pembayaran lunas.</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline btn-sm" @click="fetchSessions" :disabled="isLoading">
          <span :class="{ spinning: isLoading }">🔄</span>
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Metric Cards -->
    <div class="cashier-stats-grid">
      <div class="metric-card card">
        <div class="metric-icon">🪑</div>
        <div class="metric-details">
          <span class="metric-label">Total Meja Aktif</span>
          <span class="metric-val">{{ activeSessions.length }} Meja</span>
        </div>
      </div>

      <div class="metric-card card highlight-bill">
        <div class="metric-icon">🔔</div>
        <div class="metric-details">
          <span class="metric-label">Menunggu Pembayaran</span>
          <span class="metric-val">{{ billRequestedSessions.length }} Meja</span>
        </div>
      </div>

      <div class="metric-card card">
        <div class="metric-icon">💰</div>
        <div class="metric-details">
          <span class="metric-label">Total Tagihan Berjalan</span>
          <span class="metric-val val-currency">{{ formatRupiah(totalActiveRevenue) }}</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="sessions-filter-bar">
      <button
        class="filter-tab"
        :class="{ active: filterMode === 'ALL' }"
        @click="filterMode = 'ALL'"
      >
        Semua Meja Aktif ({{ activeSessions.length }})
      </button>
      <button
        class="filter-tab"
        :class="{ active: filterMode === 'BILL_REQUESTED' }"
        @click="filterMode = 'BILL_REQUESTED'"
      >
        🔔 Permintaan Tagihan ({{ billRequestedSessions.length }})
      </button>
    </div>

    <!-- Sessions Grid -->
    <div v-if="isLoading && activeSessions.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat status meja kasir...</p>
    </div>

    <div v-else-if="filteredSessions.length === 0" class="empty-sessions">
      <div class="empty-icon">☕</div>
      <h3>Tidak Ada Meja Aktif Saat Ini</h3>
      <p>Seluruh sesi meja telah selesai atau belum ada pelanggan yang memindai QR.</p>
    </div>

    <div v-else class="sessions-grid">
      <TableSessionCard
        v-for="sess in filteredSessions"
        :key="sess.id"
        :session="sess"
        :is-closing="closingSessionId === sess.id"
        @close-session="handleCloseSession"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navbar from '../../components/common/Navbar.vue';
import TableSessionCard from '../../components/staff/TableSessionCard.vue';
import { tableApi } from '../../services/api';

const activeSessions = ref([]);
const isLoading = ref(false);
const closingSessionId = ref(null);
const filterMode = ref('ALL'); // 'ALL' | 'BILL_REQUESTED'
let pollTimer = null;

const fetchSessions = async () => {
  isLoading.value = true;
  try {
    const res = await tableApi.getActiveSessions();
    if (res.success) {
      activeSessions.value = res.sessions || [];
    }
  } catch (error) {
    console.error('Gagal mengambil sesi meja kasir:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleCloseSession = async (sessionId, tableNumber) => {
  const confirmClose = window.confirm(
    `Konfirmasi: Apakah pembayaran untuk Meja #${tableNumber} telah diterima dan sesi akan ditutup?`
  );
  if (!confirmClose) return;

  closingSessionId.value = sessionId;
  try {
    const res = await tableApi.closeSession(sessionId);
    if (res.success) {
      alert(`Sesi Meja #${tableNumber} berhasil ditutup. Meja siap untuk pelanggan baru.`);
      await fetchSessions();
    }
  } catch (error) {
    alert(error.message || 'Gagal menutup sesi meja.');
  } finally {
    closingSessionId.value = null;
  }
};

const billRequestedSessions = computed(() =>
  activeSessions.value.filter((s) => s.status === 'BILL_REQUESTED')
);

const filteredSessions = computed(() => {
  if (filterMode.value === 'BILL_REQUESTED') {
    return billRequestedSessions.value;
  }
  return activeSessions.value;
});

const totalActiveRevenue = computed(() => {
  return activeSessions.value.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
});

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
};

onMounted(() => {
  fetchSessions();
  pollTimer = setInterval(fetchSessions, 6000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.cashier-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.6rem;
  color: var(--honey-dark);
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.spinning {
  display: inline-block;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.cashier-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 24px;
}

@media (max-width: 800px) {
  .cashier-stats-grid {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
}

.metric-card.highlight-bill {
  background: #fff7ed;
  border-color: #fdba74;
}

.metric-icon {
  font-size: 2.2rem;
}

.metric-details {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
}

.metric-val {
  font-family: 'Outfit', sans-serif;
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
}

.val-currency {
  color: var(--honey-dark);
}

.sessions-filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-tab {
  padding: 8px 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tab.active {
  background: var(--honey-primary);
  color: #fff;
  border-color: var(--honey-primary);
}

.sessions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.loading-state,
.empty-sessions {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}
</style>
