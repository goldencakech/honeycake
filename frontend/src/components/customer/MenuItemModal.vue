<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content item-modal">
      <button class="close-btn" @click="$emit('close')">&times;</button>

      <div class="modal-image-wrap">
        <img :src="menu.imageUrl" :alt="menu.name" class="modal-image" />
        <span class="modal-category">{{ menu.category }}</span>
      </div>

      <div class="modal-body">
        <div class="item-title-row">
          <h2 class="item-title">{{ menu.name }}</h2>
          <span class="item-price">{{ formatRupiah(menu.price) }}</span>
        </div>

        <p class="item-desc">{{ menu.description || 'Pilihan istimewa dari dapur HoneyCake yang disiapkan secara segar untuk Anda.' }}</p>

        <!-- Custom Notes -->
        <div class="form-group notes-group">
          <label class="form-label" for="menu-notes">Catatan Khusus (Opsional):</label>
          <textarea
            id="menu-notes"
            v-model="notes"
            class="form-control notes-input"
            rows="2"
            placeholder="Contoh: Kurang manis, tanpa kayu manis, es dipisah..."
          ></textarea>
        </div>

        <!-- Quantity Stepper & Add Action -->
        <div class="action-footer">
          <div class="qty-stepper">
            <button
              class="stepper-btn"
              :disabled="quantity <= 1"
              @click="decrement"
              aria-label="Kurangi jumlah"
            >
              -
            </button>
            <span class="qty-number">{{ quantity }}</span>
            <button
              class="stepper-btn"
              @click="increment"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>

          <button class="btn btn-primary btn-add-cart" @click="handleAddToCart">
            <span>Pesan • {{ formatRupiah(totalPrice) }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  menu: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close', 'add-to-cart']);

const quantity = ref(1);
const notes = ref('');

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      quantity.value = 1;
      notes.value = '';
    }
  }
);

const totalPrice = computed(() => {
  return (props.menu?.price || 0) * quantity.value;
});

const increment = () => {
  quantity.value += 1;
};

const decrement = () => {
  if (quantity.value > 1) {
    quantity.value -= 1;
  }
};

const handleAddToCart = () => {
  emit('add-to-cart', {
    menu: props.menu,
    quantity: quantity.value,
    notes: notes.value
  });
  emit('close');
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
.item-modal {
  max-width: 440px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.close-btn:hover {
  transform: scale(1.1);
}

.modal-image-wrap {
  position: relative;
  width: 100%;
  height: 220px;
  background: #f0e6d6;
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-category {
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: rgba(31, 27, 22, 0.8);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.modal-body {
  padding: 20px;
}

.item-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.item-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-main);
}

.item-price {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--honey-dark);
  white-space: nowrap;
}

.item-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 16px;
}

.notes-group {
  margin-bottom: 20px;
}

.notes-input {
  resize: none;
  font-size: 0.875rem;
}

.action-footer {
  display: flex;
  align-items: center;
  gap: 14px;
}

.qty-stepper {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--border-subtle);
  border-radius: var(--radius-full);
  background: var(--bg-muted);
  padding: 4px;
}

.stepper-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: none;
  background: #fff;
  color: var(--text-main);
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: var(--transition-fast);
}

.stepper-btn:hover:not(:disabled) {
  background: var(--honey-primary-light);
  color: var(--honey-dark);
}

.stepper-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.qty-number {
  min-width: 32px;
  text-align: center;
  font-weight: 700;
  font-size: 1rem;
}

.btn-add-cart {
  flex: 1;
  padding: 12px 16px;
  border-radius: var(--radius-full);
}
</style>
