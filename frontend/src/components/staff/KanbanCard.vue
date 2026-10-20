<template>
  <div class="kanban-card" :class="[`status-${order.orderStatus.toLowerCase()}`]">
    <div class="kanban-card-header">
      <div class="table-tag">
        <span class="table-icon">🪑</span>
        <span class="table-num">Meja #{{ order.tableNumber }}</span>
      </div>
      <span class="order-time">{{ formatTime(order.createdAt) }}</span>
    </div>

    <!-- Items List -->
    <div class="kanban-items">
      <div v-for="(item, idx) in order.orderItems" :key="idx" class="kanban-item-row">
        <div class="item-main">
          <span class="item-badge">{{ item.quantity }}x</span>
          <span class="item-title">{{ item.name }}</span>
        </div>
        <div v-if="item.notes" class="item-kitchen-note">
          ⚠️ <em>"{{ item.notes }}"</em>
        </div>
      </div>
    </div>

    <!-- Subtotal & Status Action -->
    <div class="kanban-footer">
      <span class="kanban-price">{{ formatRupiah(order.subtotal) }}</span>

      <div class="kanban-actions">
        <button
          v-if="order.orderStatus === 'PENDING'"
          class="btn btn-primary btn-sm"
          @click="$emit('update-status', order.id, 'PREPARING')"
        >
          <span>🍳 Racik</span>
        </button>

        <button
          v-else-if="order.orderStatus === 'PREPARING'"
          class="btn btn-secondary btn-sm"
          @click="$emit('update-status', order.id, 'READY')"
        >
          <span>🔔 Siap</span>
        </button>

        <button
          v-else-if="order.orderStatus === 'READY'"
          class="btn btn-primary btn-sm btn-deliver"
          @click="$emit('update-status', order.id, 'DELIVERED')"
        >
          <span>✅ Diantar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  order: {
    type: Object,
    required: true
  }
});

defineEmits(['update-status']);

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
</script>

<style scoped>
.kanban-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid var(--honey-primary);
}

.kanban-card:hover {
  box-shadow: var(--shadow-md);
}

.kanban-card.status-pending {
  border-left-color: #f59e0b;
}

.kanban-card.status-preparing {
  border-left-color: #3b82f6;
}

.kanban-card.status-ready {
  border-left-color: #10b981;
}

.kanban-card.status-delivered {
  border-left-color: #8b5cf6;
  opacity: 0.85;
}

.kanban-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--honey-primary-light);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.table-num {
  font-weight: 800;
  font-size: 0.875rem;
  color: var(--honey-dark);
}

.order-time {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.kanban-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: var(--bg-muted);
  padding: 10px;
  border-radius: var(--radius-sm);
}

.kanban-item-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.875rem;
}

.item-badge {
  font-weight: 800;
  color: var(--honey-dark);
  background: #fff;
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
}

.item-title {
  font-weight: 600;
  color: var(--text-main);
}

.item-kitchen-note {
  font-size: 0.75rem;
  color: #b45309;
  padding-left: 28px;
}

.kanban-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px dashed var(--border-subtle);
  padding-top: 10px;
}

.kanban-price {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-main);
}

.btn-deliver {
  background: #10b981;
  color: #fff;
}
</style>
