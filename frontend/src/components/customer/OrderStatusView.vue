<template>
  <div class="order-status-view">
    <div class="status-top-bar">
      <div>
        <h2 class="view-title">Status Pesanan</h2>
        <span class="view-subtitle">Meja #{{ tableNumber }} • {{ orders.length }} Kali Pemesanan</span>
      </div>
      <button class="btn btn-outline btn-sm btn-refresh" @click="fetchOrders" :disabled="isLoading">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: isLoading }"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && orders.length === 0" class="loading-state">
      <div class="spinner"></div>
      <p>Memuat status pesanan meja Anda...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-orders">
      <div class="empty-icon">🧾</div>
      <h3>Belum Ada Pesanan yang Dikirim</h3>
      <p>Anda belum mengirimkan pesanan ke dapur. Pilih menu favorit Anda dan klik pesan!</p>
      <button class="btn btn-primary btn-sm" @click="$emit('back-to-menu')">Buka Katalog Menu</button>
    </div>

    <!-- Orders History List -->
    <div v-else class="orders-timeline">
      <!-- Total Spent Header Card -->
      <div class="summary-card">
        <div class="summary-item">
          <span class="label">Total Tagihan Kumulatif:</span>
          <span class="val-total">{{ formatRupiah(totalSpent) }}</span>
        </div>
        <div class="summary-item" v-if="sessionStatus === 'BILL_REQUESTED'">
          <span class="badge badge-bill">🔔 Tagihan Diminta ({{ paymentMethod || 'Menunggu' }})</span>
        </div>
      </div>

      <!-- Each Order Entry -->
      <div v-for="(order, index) in orders" :key="order.id" class="order-card card">
        <div class="order-header">
          <div class="order-meta">
            <span class="order-batch">Pesanan ke-{{ orders.length - index }}</span>
            <span class="order-time">{{ formatTime(order.createdAt) }}</span>
          </div>
          <span :class="['badge', `badge-${order.orderStatus.toLowerCase()}`]">
            {{ getStatusLabel(order.orderStatus) }}
          </span>
        </div>

        <!-- Visual Stepper Progress -->
        <div class="stepper-progress">
          <div
            v-for="(step, sIdx) in steps"
            :key="step.key"
            class="step-node"
            :class="{
              active: isStepActive(order.orderStatus, step.key),
              current: order.orderStatus === step.key
            }"
          >
            <div class="step-circle">{{ sIdx + 1 }}</div>
            <span class="step-label">{{ step.label }}</span>
          </div>
        </div>

        <!-- Items Breakdown -->
        <div class="order-items-breakdown">
          <div
            v-for="(item, iIdx) in order.orderItems"
            :key="iIdx"
            class="breakdown-row"
          >
            <div class="breakdown-name">
              <span class="item-qty">{{ item.quantity }}x</span>
              <span class="item-text">{{ item.name }}</span>
              <span v-if="item.notes" class="item-note-pill">"{{ item.notes }}"</span>
            </div>
            <span class="breakdown-price">{{ formatRupiah(item.price * item.quantity) }}</span>
          </div>
        </div>

        <div class="order-subtotal-row">
          <span>Subtotal Pesanan Ini</span>
          <strong>{{ formatRupiah(order.subtotal) }}</strong>
        </div>
      </div>

      <!-- Button for Supplementary Order (Pesanan Susulan) -->
      <div v-if="canOrder" class="supplementary-action">
        <button class="btn btn-secondary btn-block" @click="$emit('back-to-menu')">
          ➕ Tambah Pesanan Susulan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { orderApi } from '../../services/api';

const props = defineProps({
  tableNumber: {
    type: [Number, String],
    default: 1
  },
  sessionToken: {
    type: String,
    required: true
  },
  canOrder: {
    type: Boolean,
    default: true
  },
  sessionStatus: {
    type: String,
    default: 'ACTIVE'
  },
  paymentMethod: {
    type: String,
    default: null
  }
});

defineEmits(['back-to-menu']);

const orders = ref([]);
const isLoading = ref(false);

const steps = [
  { key: 'PENDING', label: 'Diterima' },
  { key: 'PREPARING', label: 'Diracik' },
  { key: 'READY', label: 'Siap' },
  { key: 'DELIVERED', label: 'Selesai' }
];

const statusOrder = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'];

const isStepActive = (currentStatus, stepKey) => {
  const currentIdx = statusOrder.indexOf(currentStatus);
  const stepIdx = statusOrder.indexOf(stepKey);
  return stepIdx <= currentIdx;
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'PENDING':
      return '⏳ Menunggu';
    case 'PREPARING':
      return '🍳 Diracik';
    case 'READY':
      return '🔔 Siap Diantar';
    case 'DELIVERED':
      return '✅ Terkirim';
    default:
      return status;
  }
};

const totalSpent = computed(() => {
  return orders.value.reduce((acc, ord) => acc + (ord.subtotal || 0), 0);
});

const fetchOrders = async () => {
  if (!props.sessionToken) return;
  isLoading.value = true;
  try {
    const res = await orderApi.getOrdersByTableToken(props.sessionToken);
    if (res.success) {
      orders.value = res.orders || [];
    }
  } catch (error) {
    console.error('Gagal mengambil status pesanan:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
};

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.order-status-view {
  padding: 16px;
}

.status-top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.view-title {
  font-size: 1.25rem;
}

.view-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.btn-refresh {
  gap: 4px;
}

.spinning {
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-state,
.empty-orders {
  text-align: center;
  padding: 40px 16px;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.empty-orders h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.empty-orders p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.summary-card {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #fcd34d;
  border-radius: var(--radius-md);
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.summary-item .label {
  font-size: 0.825rem;
  color: var(--honey-dark);
  display: block;
}

.val-total {
  font-family: 'Outfit', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  color: #78350f;
}

.orders-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  padding: 16px;
  border-radius: var(--radius-lg);
  background: var(--bg-surface);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.order-batch {
  font-weight: 700;
  font-size: 0.95rem;
  display: block;
}

.order-time {
  font-size: 0.775rem;
  color: var(--text-muted);
}

/* Stepper */
.stepper-progress {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 12px 0 20px 0;
  padding: 0 10px;
}

.stepper-progress::before {
  content: '';
  position: absolute;
  top: 13px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--border-subtle);
  z-index: 1;
}

.step-node {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-circle {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid var(--border-subtle);
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 4px;
  transition: all 0.25s ease;
}

.step-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.step-node.active .step-circle {
  background: var(--honey-primary);
  border-color: var(--honey-primary);
  color: #fff;
}

.step-node.current .step-circle {
  box-shadow: 0 0 0 4px rgba(217, 119, 6, 0.25);
  animation: pulse-step 1.5s infinite;
}

@keyframes pulse-step {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.order-items-breakdown {
  border-top: 1px dashed var(--border-subtle);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 0.85rem;
}

.breakdown-name {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.item-qty {
  font-weight: 700;
  color: var(--honey-dark);
}

.item-note-pill {
  font-size: 0.725rem;
  color: #b45309;
  background: #fef3c7;
  padding: 1px 6px;
  border-radius: var(--radius-sm);
}

.breakdown-price {
  font-weight: 600;
  white-space: nowrap;
}

.order-subtotal-row {
  border-top: 1px solid var(--border-subtle);
  margin-top: 12px;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.supplementary-action {
  margin-top: 10px;
}
</style>
