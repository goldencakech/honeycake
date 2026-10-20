<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content bill-modal">
      <div class="bill-modal-header">
        <h2 class="bill-title">Minta Tagihan (Request Bill)</h2>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="bill-modal-body">
        <div class="table-badge-bar">
          <span>Meja <strong>#{{ tableNumber }}</strong></span>
          <span class="total-bill-preview">Estimasi: {{ formatRupiah(totalBill) }}</span>
        </div>

        <p class="bill-instruction">
          Silakan pilih metode pembayaran yang Anda inginkan. Pelayan atau kasir akan segera mendatangi meja Anda untuk memproses transaksi.
        </p>

        <!-- Payment Methods Selection -->
        <div class="payment-options">
          <label
            class="payment-card"
            :class="{ active: selectedMethod === 'E-Wallet' }"
            @click="selectedMethod = 'E-Wallet'"
          >
            <input type="radio" v-model="selectedMethod" value="E-Wallet" />
            <div class="payment-icon">📱</div>
            <div class="payment-info">
              <span class="payment-name">E-Wallet (QRIS)</span>
              <span class="payment-sub">GoPay, OVO, ShopeePay, DANA</span>
            </div>
            <div class="custom-radio"></div>
          </label>

          <label
            class="payment-card"
            :class="{ active: selectedMethod === 'M-Banking' }"
            @click="selectedMethod = 'M-Banking'"
          >
            <input type="radio" v-model="selectedMethod" value="M-Banking" />
            <div class="payment-icon">💳</div>
            <div class="payment-info">
              <span class="payment-name">M-Banking / Transfer</span>
              <span class="payment-sub">BCA, Mandiri, BRI, BNI</span>
            </div>
            <div class="custom-radio"></div>
          </label>

          <label
            class="payment-card"
            :class="{ active: selectedMethod === 'Cashier' }"
            @click="selectedMethod = 'Cashier'"
          >
            <input type="radio" v-model="selectedMethod" value="Cashier" />
            <div class="payment-icon">💵</div>
            <div class="payment-info">
              <span class="payment-name">Bayar di Kasir (Tunai / EDC)</span>
              <span class="payment-sub">Bayar langsung di meja kasir kafe</span>
            </div>
            <div class="custom-radio"></div>
          </label>
        </div>

        <div class="bill-notice">
          ℹ️ Setelah meminta tagihan, penambahan pesanan baru akan dinonaktifkan otomatis.
        </div>

        <div class="bill-actions">
          <button class="btn btn-outline" @click="$emit('close')">Batal</button>
          <button
            class="btn btn-primary flex-1"
            :disabled="!selectedMethod || isSubmitting"
            @click="handleConfirmBill"
          >
            <span v-if="isSubmitting">Memproses...</span>
            <span v-else>Konfirmasi Tagihan</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  tableNumber: {
    type: [Number, String],
    default: 1
  },
  totalBill: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'confirm']);

const selectedMethod = ref('E-Wallet');
const isSubmitting = ref(false);

const handleConfirmBill = () => {
  if (!selectedMethod.value) return;
  isSubmitting.value = true;
  emit('confirm', selectedMethod.value);
  isSubmitting.value = false;
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
.bill-modal {
  padding: 0;
}

.bill-modal-header {
  padding: 16px 20px;
  background: var(--bg-muted);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bill-title {
  font-size: 1.15rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}

.bill-modal-body {
  padding: 20px;
}

.table-badge-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--honey-primary-light);
  color: var(--honey-dark);
  padding: 8px 14px;
  border-radius: var(--radius-md);
  margin-bottom: 14px;
  font-size: 0.9rem;
}

.total-bill-preview {
  font-weight: 800;
  font-size: 1rem;
}

.bill-instruction {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 16px;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.payment-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  cursor: pointer;
  transition: var(--transition-fast);
}

.payment-card input[type='radio'] {
  display: none;
}

.payment-card:hover {
  border-color: var(--honey-accent);
}

.payment-card.active {
  border-color: var(--honey-primary);
  background: #fffdf7;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.15);
}

.payment-icon {
  font-size: 1.5rem;
}

.payment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.payment-name {
  font-weight: 700;
  font-size: 0.925rem;
}

.payment-sub {
  font-size: 0.775rem;
  color: var(--text-muted);
}

.custom-radio {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid var(--border-subtle);
  position: relative;
}

.payment-card.active .custom-radio {
  border-color: var(--honey-primary);
}

.payment-card.active .custom-radio::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 8px;
  height: 8px;
  background: var(--honey-primary);
  border-radius: 50%;
}

.bill-notice {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-muted);
  padding: 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 18px;
}

.bill-actions {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}
</style>
