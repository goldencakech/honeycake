<template>
  <div class="dashboard-viewport">
    <Navbar />

    <div class="kanban-page-header">
      <div>
        <h1 class="page-title">Dapur & Pesanan Masuk (Kitchen Board)</h1>
        <p class="page-subtitle">Pantau dan kelola antrean pesanan dari meja pelanggan secara real-time.</p>
      </div>

      <div class="header-actions">
        <button class="btn btn-outline btn-sm" @click="fetchOrders" :disabled="isLoading">
          <span :class="{ spinning: isLoading }">🔄</span>
          <span>Refresh</span>
        </button>

        <label class="auto-refresh-toggle">
          <input type="checkbox" v-model="autoRefresh" />
          <span>Auto-refresh (5s)</span>
        </label>
      </div>
    </div>

    <!-- Kanban Columns Grid -->
    <div class="kanban-board">
      <!-- 1. PENDING -->
      <div class="kanban-column col-pending">
        <div class="column-header">
          <div class="header-title-wrap">
            <span class="status-indicator-dot dot-pending"></span>
            <h2>1. Menunggu Konfirmasi</h2>
          </div>
          <span class="count-pill">{{ pendingOrders.length }}</span>
        </div>

        <div class="column-cards">
          <div v-if="pendingOrders.length === 0" class="empty-column-state">
            <span>Tidak ada pesanan menunggu</span>
          </div>
          <KanbanCard
            v-for="order in pendingOrders"
            :key="order.id"
            :order="order"
            @update-status="handleUpdateStatus"
          />
        </div>
      </div>

      <!-- 2. PREPARING -->
      <div class="kanban-column col-preparing">
        <div class="column-header">
          <div class="header-title-wrap">
            <span class="status-indicator-dot dot-preparing"></span>
            <h2>2. Sedang Diracik Dapur</h2>
          </div>
          <span class="count-pill">{{ preparingOrders.length }}</span>
        </div>

        <div class="column-cards">
          <div v-if="preparingOrders.length === 0" class="empty-column-state">
            <span>Dapur sedang santai</span>
          </div>
          <KanbanCard
            v-for="order in preparingOrders"
            :key="order.id"
            :order="order"
            @update-status="handleUpdateStatus"
          />
        </div>
      </div>

      <!-- 3. READY -->
      <div class="kanban-column col-ready">
        <div class="column-header">
          <div class="header-title-wrap">
            <span class="status-indicator-dot dot-ready"></span>
            <h2>3. Siap Diantar ke Meja</h2>
          </div>
          <span class="count-pill">{{ readyOrders.length }}</span>
        </div>

        <div class="column-cards">
          <div v-if="readyOrders.length === 0" class="empty-column-state">
            <span>Tidak ada pesanan siap antar</span>
          </div>
          <KanbanCard
            v-for="order in readyOrders"
            :key="order.id"
            :order="order"
            @update-status="handleUpdateStatus"
          />
        </div>
      </div>

      <!-- 4. DELIVERED -->
      <div class="kanban-column col-delivered">
        <div class="column-header">
          <div class="header-title-wrap">
            <span class="status-indicator-dot dot-delivered"></span>
            <h2>4. Selesai / Terkirim</h2>
          </div>
          <span class="count-pill">{{ deliveredOrders.length }}</span>
        </div>

        <div class="column-cards">
          <div v-if="deliveredOrders.length === 0" class="empty-column-state">
            <span>Belum ada pesanan terselesaikan</span>
          </div>
          <KanbanCard
            v-for="order in deliveredOrders"
            :key="order.id"
            :order="order"
            @update-status="handleUpdateStatus"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navbar from '../../components/common/Navbar.vue';
import KanbanCard from '../../components/staff/KanbanCard.vue';
import { orderApi } from '../../services/api';

const orders = ref([]);
const isLoading = ref(false);
const autoRefresh = ref(true);
let refreshTimer = null;

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const res = await orderApi.getAllOrders();
    if (res.success) {
      orders.value = res.orders || [];
    }
  } catch (error) {
    console.error('Gagal mengambil antrean pesanan:', error);
  } finally {
    isLoading.value = false;
  }
};

const handleUpdateStatus = async (orderId, newStatus) => {
  try {
    const res = await orderApi.updateOrderStatus(orderId, newStatus);
    if (res.success) {
      // Perbarui status lokal langsung untuk responsivitas instan
      const idx = orders.value.findIndex((o) => o.id === orderId);
      if (idx > -1) {
        orders.value[idx].orderStatus = newStatus;
      }
    }
  } catch (err) {
    alert(err.message || 'Gagal mengubah status pesanan.');
  }
};

const pendingOrders = computed(() =>
  orders.value.filter((o) => o.orderStatus === 'PENDING')
);

const preparingOrders = computed(() =>
  orders.value.filter((o) => o.orderStatus === 'PREPARING')
);

const readyOrders = computed(() =>
  orders.value.filter((o) => o.orderStatus === 'READY')
);

const deliveredOrders = computed(() =>
  orders.value.filter((o) => o.orderStatus === 'DELIVERED')
);

onMounted(() => {
  fetchOrders();
  refreshTimer = setInterval(() => {
    if (autoRefresh.value) {
      fetchOrders();
    }
  }, 5000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped>
.kanban-page-header {
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.auto-refresh-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
}

.spinning {
  display: inline-block;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  align-items: flex-start;
}

@media (max-width: 1100px) {
  .kanban-board {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .kanban-board {
    grid-template-columns: 1fr;
  }
}

.kanban-column {
  background: var(--bg-muted);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 14px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.header-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.column-header h2 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}

.status-indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-pending { background: #f59e0b; }
.dot-preparing { background: #3b82f6; }
.dot-ready { background: #10b981; }
.dot-delivered { background: #8b5cf6; }

.count-pill {
  background: #ffffff;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 800;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.column-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.empty-column-state {
  text-align: center;
  padding: 40px 10px;
  font-size: 0.85rem;
  color: var(--text-light);
  font-style: italic;
}
</style>
