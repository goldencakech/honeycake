<template>
  <div class="menu-card" :class="{ 'menu-unavailable': !menu.isAvailable }">
    <div class="menu-image-container">
      <img
        :src="menu.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&auto=format&fit=crop&q=80'"
        :alt="menu.name"
        class="menu-image"
        loading="lazy"
      />
      <span class="category-badge">{{ menu.category }}</span>
      <span v-if="!menu.isAvailable" class="sold-out-badge">Habis</span>
    </div>

    <div class="menu-info">
      <div class="menu-header">
        <h3 class="menu-title">{{ menu.name }}</h3>
        <span class="menu-price">{{ formatRupiah(menu.price) }}</span>
      </div>

      <p class="menu-desc" v-if="menu.description">{{ menu.description }}</p>

      <div class="menu-footer">
        <button
          v-if="canOrder && menu.isAvailable"
          @click="$emit('select', menu)"
          class="btn btn-primary btn-sm btn-add"
          aria-label="Pilih menu"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Tambah
        </button>
        <span v-else-if="!menu.isAvailable" class="text-muted-sm">Tidak Tersedia</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  menu: {
    type: Object,
    required: true
  },
  canOrder: {
    type: Boolean,
    default: true
  }
});

defineEmits(['select']);

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
};
</script>

<style scoped>
.menu-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease;
}

.menu-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.menu-unavailable {
  opacity: 0.65;
  filter: grayscale(0.2);
}

.menu-image-container {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f0e6d6;
}

.menu-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.menu-card:hover .menu-image {
  transform: scale(1.05);
}

.category-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(31, 27, 22, 0.75);
  backdrop-filter: blur(6px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}

.sold-out-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-full);
}

.menu-info {
  padding: 14px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.menu-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1.3;
}

.menu-price {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--honey-dark);
  white-space: nowrap;
}

.menu-desc {
  font-size: 0.825rem;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.menu-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: auto;
}

.btn-add {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 0.85rem;
}

.text-muted-sm {
  font-size: 0.8rem;
  color: var(--text-light);
  font-style: italic;
}
</style>
