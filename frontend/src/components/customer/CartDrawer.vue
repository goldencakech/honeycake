<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="cart-drawer">
      <div class="drawer-header">
        <div class="header-info">
          <h2 class="drawer-title">Pesanan Meja #{{ tableNumber }}</h2>
          <span class="items-count">{{ cartStore.totalItems }} item dipilih</span>
        </div>
        <button class="close-drawer-btn" @click="$emit('close')">&times;</button>
      </div>

      <!-- Empty State -->
      <div v-if="cartStore.isEmpty" class="empty-cart">
        <div class="empty-icon">🍰</div>
        <h3>Keranjang Anda Masih Kosong</h3>
        <p>Silakan pilih kue, kopi, atau pastry lezat dari menu untuk memulai pesanan.</p>
        <button class="btn btn-secondary btn-sm" @click="$emit('close')">Lihat Menu</button>
      </div>

      <!-- Item List -->
      <div v-else class="cart-items-list">
        <div v-for="(item, index) in cartStore.items" :key="index" class="cart-item">
          <img
            :src="item.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&auto=format&fit=crop&q=80'"
            :alt="item.name"
            class="item-thumb"
          />
          <div class="item-details">
            <div class="item-name-row">
              <span class="item-name">{{ item.name }}</span>
              <button class="delete-btn" @click="cartStore.removeItem(index)" title="Hapus item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>

            <span class="item-unit-price">{{ formatRupiah(item.price) }}</span>

            <div v-if="item.notes" class="item-note">
              <span>Catatan:</span> {{ item.notes }}
            </div>

            <div class="item-controls">
              <div class="mini-stepper">
                <button @click="cartStore.updateQuantity(index, item.quantity - 1)">-</button>
                <span>{{ item.quantity }}</span>
                <button @click="cartStore.updateQuantity(index, item.quantity + 1)">+</button>
              </div>
              <span class="item-subtotal">{{ formatRupiah(item.price * item.quantity) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Drawer Footer -->
      <div v-if="!cartStore.isEmpty" class="drawer-footer">
        <div class="total-row">
          <span class="total-label">Total Pesanan Ini:</span>
          <span class="total-value">{{ formatRupiah(cartStore.totalPrice) }}</span>
        </div>

        <p v-if="!canOrder" class="alert-bill-warning">
          ⚠️ Meja ini sedang meminta tagihan atau telah ditutup. Pesanan baru dinonaktifkan.
        </p>

        <button
          v-else
          class="btn btn-primary btn-block btn-submit-order"
          :disabled="isSubmitting"
          @click="submitOrder"
        >
          <span v-if="isSubmitting">Mengirimkan ke Dapur...</span>
          <span v-else>Konfirmasi & Kirim Pesanan 🚀</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useCartStore } from '../../stores/cart';
import { orderApi } from '../../services/api';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
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
  }
});

const emit = defineEmits(['close', 'order-placed']);

const cartStore = useCartStore();
const isSubmitting = ref(false);

const submitOrder = async () => {
  if (cartStore.isEmpty) return;
  isSubmitting.value = true;

  try {
    const orderItems = cartStore.items.map((item) => ({
      menuId: item.menuId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      notes: item.notes || ''
    }));

    const response = await orderApi.createOrder(orderItems, props.sessionToken);

    if (response.success) {
      cartStore.clearCart();
      emit('order-placed', response.order);
      emit('close');
    }
  } catch (error) {
    alert(error.message || 'Gagal mengirim pesanan. Silakan coba lagi.');
  } finally {
    isSubmitting.value = false;
  }
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
.cart-drawer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 540px;
  max-height: 85vh;
  background: var(--bg-surface);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUpDrawer 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUpDrawer {
  from {
    transform: translate(-50%, 100%);
  }
  to {
    transform: translate(-50%, 0);
  }
}

.drawer-header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-muted);
}

.drawer-title {
  font-size: 1.15rem;
  font-weight: 700;
}

.items-count {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.close-drawer-btn {
  background: transparent;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: var(--text-muted);
}

.empty-cart {
  padding: 40px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.empty-cart h3 {
  font-size: 1.1rem;
  margin-bottom: 6px;
}

.empty-cart p {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.cart-items-list {
  padding: 16px 20px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart-item {
  display: flex;
  gap: 12px;
  background: var(--bg-card);
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
}

.item-thumb {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.item-name {
  font-weight: 700;
  font-size: 0.95rem;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 2px;
}

.item-unit-price {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: block;
  margin-bottom: 4px;
}

.item-note {
  font-size: 0.775rem;
  background: var(--honey-primary-light);
  color: var(--honey-dark);
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}

.item-note span {
  font-weight: 600;
}

.item-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mini-stepper {
  display: flex;
  align-items: center;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.mini-stepper button {
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 700;
}

.mini-stepper span {
  font-size: 0.85rem;
  font-weight: 700;
  min-width: 20px;
  text-align: center;
}

.item-subtotal {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--honey-dark);
}

.drawer-footer {
  padding: 18px 20px;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.total-label {
  font-weight: 600;
  font-size: 1rem;
}

.total-value {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.3rem;
  color: var(--honey-dark);
}

.alert-bill-warning {
  font-size: 0.825rem;
  color: #b45309;
  background: #fef3c7;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.btn-submit-order {
  padding: 13px;
  border-radius: var(--radius-full);
}
</style>
