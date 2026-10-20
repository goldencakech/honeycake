<template>
  <div class="session-card" :class="[`status-${session.status.toLowerCase()}`]">
    <div class="session-top">
      <div class="table-badge-large">
        <span class="label-table">MEJA</span>
        <span class="num-table">#{{ session.tableNumber }}</span>
      </div>
      <div class="status-tags">
        <span :class="['badge', getStatusBadgeClass(session.status)]">
          {{ getStatusLabel(session.status) }}
        </span>
        <span v-if="session.paymentMethod" class="badge badge-payment">
          {{ formatPaymentMethod(session.paymentMethod) }}
        </span>
      </div>
    </div>

    <!-- Bill & Order Stats -->
    <div class="session-stats">
      <div class="stat-col">
        <span class="stat-lbl">Jumlah Pesanan</span>
        <span class="stat-val">{{ session.orderCount || session.orders?.length || 0 }} batch ({{ session.totalItems || 0 }} item)</span>
      </div>
      <div class="stat-col align-right">
        <span class="stat-lbl">Total Tagihan</span>
        <span class="stat-total">{{ formatRupiah(session.totalAmount || session.totalBill || 0) }}</span>
      </div>
    </div>

    <!-- Active Orders Snippet -->
    <div v-if="session.orders && session.orders.length > 0" class="order-snippets">
      <div v-for="ord in session.orders" :key="ord.id" class="snippet-row">
        <span class="snippet-batch">Order ({{ ord.orderStatus }}):</span>
        <span class="snippet-items">
          {{ ord.orderItems.map(i => `${i.quantity}x ${i.name}`).join(', ') }}
        </span>
      </div>
    </div>

    <!-- Cashier Action -->
    <div class="session-actions">
      <button
        v-if="session.status !== 'CLOSED'"
        class="btn btn-primary btn-block btn-close-session"
        :class="{ 'btn-highlight': session.status === 'BILL_REQUESTED' }"
        :disabled="isClosing"
        @click="$emit('close-session', session.id, session.tableNumber)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Proses Bayar & Tutup Sesi</span>
      </button>
      <span v-else class="closed-label">✅ Sesi Selesai / Ditutup</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  session: {
    type: Object,
    required: true
  },
  isClosing: {
    type: Boolean,
    default: false
  }
});

defineEmits(['close-session']);

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'badge-active';
    case 'BILL_REQUESTED':
      return 'badge-bill';
    case 'CLOSED':
      return 'badge-closed';
    default:
      return 'badge-active';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '🟢 Aktif Memesan';
    case 'BILL_REQUESTED':
      return '🔔 Minta Tagihan';
    case 'CLOSED':
      return '⚪ Ditutup';
    default:
      return status;
  }
};

const formatPaymentMethod = (method) => {
  if (!method) return '';
  if (method === 'MBANKING') return '💳 M-Banking';
  if (method === 'EWALLET') return '📱 E-Wallet';
  if (method === 'CASHIER') return '💵 Kasir (Tunai)';
  return `💳 ${method}`;
};

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
};
</script>

<style scoped>
.session-card {
  background: var(--bg-surface);
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.session-card:hover {
  box-shadow: var(--shadow-md);
}

.session-card.status-bill_requested {
  border-color: #f97316;
  background: #fffaf0;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.15);
}

.session-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.table-badge-large {
  display: flex;
  flex-direction: column;
}

.label-table {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--text-muted);
}

.num-table {
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--honey-dark);
  line-height: 1;
}

.status-tags {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.badge-payment {
  background: #ede9fe;
  color: #6d28d9;
}

.session-stats {
  display: flex;
  justify-content: space-between;
  background: var(--bg-muted);
  padding: 10px 14px;
  border-radius: var(--radius-md);
}

.stat-col {
  display: flex;
  flex-direction: column;
}

.stat-lbl {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.stat-val {
  font-size: 0.85rem;
  font-weight: 600;
}

.stat-total {
  font-family: 'Outfit', sans-serif;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--honey-dark);
}

.align-right {
  text-align: right;
}

.order-snippets {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.775rem;
  color: var(--text-muted);
  max-height: 80px;
  overflow-y: auto;
}

.snippet-batch {
  font-weight: 700;
  color: var(--text-main);
  margin-right: 4px;
}

.btn-close-session {
  padding: 11px;
}

.btn-highlight {
  background: linear-gradient(135deg, #ea580c 0%, #c2410c 100%);
  animation: pulse-bill 2s infinite ease-in-out;
}

.closed-label {
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-light);
  font-weight: 600;
}
</style>
