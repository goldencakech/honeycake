<template>
  <div class="customer-viewport">
    <!-- Navbar -->
    <Navbar @open-request-bill="isBillModalOpen = true" />

    <!-- NO TOKEN / WELCOME SIMULATOR -->
    <div v-if="!sessionStore.token" class="no-token-container">
      <div class="welcome-card card">
        <div class="welcome-badge">🍯 HoneyCake Smart Café</div>
        <h1 class="welcome-title">Selamat Datang di Meja Anda!</h1>
        <p class="welcome-desc">
          Sistem Smart Self-Ordering memungkinkan Anda memesan menu, menambah pesanan, dan meminta tagihan langsung dari meja tanpa harus menunggu pelayan.
        </p>

        <div class="demo-selector-box">
          <h3>Pilih Meja untuk Mulai Simulasi:</h3>
          <div class="demo-buttons">
            <button class="btn btn-secondary" @click="selectDemoTable(1, 'demo-table-1')">
              Meja #1 (Demo)
            </button>
            <button class="btn btn-secondary" @click="selectDemoTable(2, 'demo-table-2')">
              Meja #2 (Demo)
            </button>
            <button class="btn btn-secondary" @click="selectDemoTable(3, 'demo-table-3')">
              Meja #3 (Demo)
            </button>
          </div>
        </div>

        <div class="manual-token-form">
          <label class="form-label" for="token-input">Atau Masukkan Token Sesi Meja:</label>
          <div class="input-action-row">
            <input
              id="token-input"
              v-model="customTokenInput"
              type="text"
              class="form-control"
              placeholder="Contoh: hc-1-a1b2c3d4..."
            />
            <button class="btn btn-primary" @click="loadCustomToken" :disabled="!customTokenInput">
              Masuk
            </button>
          </div>
        </div>

        <div class="staff-callout">
          <span>Staf atau Kasir Kafe?</span>
          <router-link to="/staff/login" class="link-staff">Buka Dashboard Staf &rarr;</router-link>
        </div>
      </div>
    </div>

    <!-- MAIN CUSTOMER CONTENT (WHEN TOKEN IS ACTIVE) -->
    <div v-else class="customer-content">
      <!-- Session Alert Banners -->
      <div v-if="sessionStore.isBillRequested" class="bill-banner">
        <span class="bell-icon">🔔</span>
        <div class="bill-banner-text">
          <strong>Tagihan Telah Diminta ({{ formatPaymentMethod(sessionStore.paymentMethod) }})</strong>
          <span>Pelayan atau kasir kami akan segera menghampiri meja Anda. Penambahan pesanan baru dinonaktifkan.</span>
        </div>
      </div>

      <div v-if="sessionStore.isSessionClosed" class="closed-banner">
        <span>✅ Sesi meja ini telah selesai dan ditutup oleh kasir. Terima kasih atas kunjungan Anda di HoneyCake!</span>
      </div>

      <!-- Hero Banner -->
      <div class="hero-banner">
        <div class="hero-text">
          <span class="hero-subtitle">Freshly Baked & Handcrafted Coffee</span>
          <h2 class="hero-title">Sweet Moments at HoneyCake</h2>
        </div>
      </div>

      <!-- Tab Navigation (Menu Catalog vs Order Status) -->
      <div class="tab-switcher">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'menu' }"
          @click="activeTab = 'menu'"
        >
          <span>🍰 Katalog Menu</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          <span>🧾 Status Pesanan</span>
        </button>
      </div>

      <!-- TAB 1: MENU CATALOG -->
      <div v-if="activeTab === 'menu'" class="catalog-section">
        <!-- Search & Filter Bar -->
        <div class="search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control search-input"
            placeholder="Cari cake, latte, atau pastry..."
          />
        </div>

        <!-- Category Horizontal Pills -->
        <div class="category-pills">
          <button
            v-for="cat in categories"
            :key="cat"
            class="cat-pill"
            :class="{ active: selectedCategory === cat }"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <!-- Menu Grid -->
        <div v-if="isLoadingMenus" class="loading-grid">
          <div class="spinner"></div>
          <p>Menyiapkan daftar menu lezat...</p>
        </div>

        <div v-else-if="filteredMenus.length === 0" class="empty-filter">
          <p>Tidak ada menu yang sesuai dengan pencarian Anda.</p>
        </div>

        <div v-else class="menu-grid">
          <MenuCard
            v-for="item in filteredMenus"
            :key="item.id"
            :menu="item"
            :can-order="sessionStore.canOrder"
            @select="openItemModal"
          />
        </div>
      </div>

      <!-- TAB 2: ORDER STATUS -->
      <div v-else class="orders-section">
        <OrderStatusView
          :table-number="sessionStore.tableNumber"
          :session-token="sessionStore.token"
          :can-order="sessionStore.canOrder"
          :session-status="sessionStore.status"
          :payment-method="sessionStore.paymentMethod"
          @back-to-menu="activeTab = 'menu'"
        />
      </div>

      <!-- FLOATING CART PILL (Appears if cart not empty and canOrder) -->
      <div
        v-if="!cartStore.isEmpty && sessionStore.canOrder"
        class="floating-bottom-bar"
        @click="isCartOpen = true"
      >
        <div class="cart-pill-left">
          <div class="cart-pill-icon">
            🛒
            <span class="cart-count-badge">{{ cartStore.totalItems }}</span>
          </div>
          <div class="cart-pill-text">
            <span class="cart-pill-title">Pesanan Sementara</span>
            <span class="cart-pill-total">{{ formatRupiah(cartStore.totalPrice) }}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-sm btn-view-cart">
          <span>Lihat Pesanan &rarr;</span>
        </button>
      </div>

      <!-- ITEM DETAIL & NOTES MODAL -->
      <MenuItemModal
        :is-open="isItemModalOpen"
        :menu="selectedMenu"
        @close="isItemModalOpen = false"
        @add-to-cart="handleAddToCart"
      />

      <!-- CART DRAWER -->
      <CartDrawer
        :is-open="isCartOpen"
        :table-number="sessionStore.tableNumber"
        :session-token="sessionStore.token"
        :can-order="sessionStore.canOrder"
        @close="isCartOpen = false"
        @order-placed="handleOrderPlaced"
      />

      <!-- REQUEST BILL MODAL -->
      <RequestBillModal
        :is-open="isBillModalOpen"
        :table-number="sessionStore.tableNumber"
        :total-bill="sessionStore.totalBill"
        @close="isBillModalOpen = false"
        @confirm="handleConfirmRequestBill"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Navbar from '../../components/common/Navbar.vue';
import MenuCard from '../../components/customer/MenuCard.vue';
import MenuItemModal from '../../components/customer/MenuItemModal.vue';
import CartDrawer from '../../components/customer/CartDrawer.vue';
import RequestBillModal from '../../components/customer/RequestBillModal.vue';
import OrderStatusView from '../../components/customer/OrderStatusView.vue';
import { useCustomerSessionStore } from '../../stores/customerSession';
import { useCartStore } from '../../stores/cart';
import { menuApi } from '../../services/api';

const route = useRoute();
const router = useRouter();
const sessionStore = useCustomerSessionStore();
const cartStore = useCartStore();

const activeTab = ref('menu'); // 'menu' | 'orders'
const menus = ref([]);
const categories = ref(['Semua', 'Signature Cakes', 'Coffee & Drinks', 'Savory Pastries', 'Tea & Refreshment']);
const selectedCategory = ref('Semua');
const searchQuery = ref('');
const isLoadingMenus = ref(false);

const isItemModalOpen = ref(false);
const selectedMenu = ref(null);
const isCartOpen = ref(false);
const isBillModalOpen = ref(false);
const customTokenInput = ref('');

// Inisialisasi token dari URL query param (?token=xxx) atau localStorage
onMounted(async () => {
  const queryToken = route.query.token;
  if (queryToken) {
    sessionStore.setToken(queryToken);
    await sessionStore.fetchSession(queryToken);
  } else if (sessionStore.token) {
    await sessionStore.fetchSession();
  }

  fetchMenus();
});

// Watch query param perubahan
watch(
  () => route.query.token,
  async (newToken) => {
    if (newToken) {
      sessionStore.setToken(newToken);
      await sessionStore.fetchSession(newToken);
    }
  }
);

const fetchMenus = async () => {
  isLoadingMenus.value = true;
  try {
    const res = await menuApi.getAllMenus();
    if (res.success) {
      menus.value = res.menus || [];
      if (res.categories && res.categories.length > 0) {
        categories.value = res.categories;
      }
    }
  } catch (err) {
    console.error('Gagal mengambil daftar menu:', err);
  } finally {
    isLoadingMenus.value = false;
  }
};

const filteredMenus = computed(() => {
  return menus.value.filter((item) => {
    const matchCategory =
      selectedCategory.value === 'Semua' ||
      item.category?.toLowerCase() === selectedCategory.value?.toLowerCase();

    const matchSearch =
      !searchQuery.value ||
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.value.toLowerCase()));

    return matchCategory && matchSearch;
  });
});

const selectDemoTable = async (tableNum, token) => {
  sessionStore.setToken(token);
  router.push({ query: { token } });
  await sessionStore.fetchSession(token);
};

const loadCustomToken = async () => {
  if (!customTokenInput.value) return;
  const token = customTokenInput.value.trim();
  sessionStore.setToken(token);
  router.push({ query: { token } });
  await sessionStore.fetchSession(token);
};

const openItemModal = (menu) => {
  selectedMenu.value = menu;
  isItemModalOpen.value = true;
};

const handleAddToCart = (data) => {
  cartStore.addItem(data.menu, data.quantity, data.notes);
};

const handleOrderPlaced = () => {
  // Beralih ke tab status pesanan untuk langsung melihat kemajuan pesanan
  activeTab.value = 'orders';
  sessionStore.fetchSession();
};

const handleConfirmRequestBill = async (method) => {
  try {
    await sessionStore.requestBill(method);
    isBillModalOpen.value = false;
  } catch (err) {
    alert(err.message || 'Gagal meminta tagihan.');
  }
};

const formatPaymentMethod = (method) => {
  if (!method) return '';
  if (method === 'MBANKING') return 'M-Banking';
  if (method === 'EWALLET') return 'E-Wallet';
  if (method === 'CASHIER') return 'Kasir';
  return method;
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
.no-token-container {
  padding: 30px 18px;
}

.welcome-card {
  padding: 24px;
  text-align: center;
}

.welcome-badge {
  display: inline-block;
  background: var(--honey-primary-light);
  color: var(--honey-dark);
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px 12px;
  border-radius: var(--radius-full);
  margin-bottom: 12px;
}

.welcome-title {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.welcome-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 24px;
  line-height: 1.5;
}

.demo-selector-box {
  background: var(--bg-muted);
  padding: 18px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
}

.demo-selector-box h3 {
  font-size: 0.95rem;
  margin-bottom: 12px;
}

.demo-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.manual-token-form {
  margin-bottom: 24px;
  text-align: left;
}

.input-action-row {
  display: flex;
  gap: 8px;
}

.staff-callout {
  font-size: 0.85rem;
  color: var(--text-muted);
  display: flex;
  justify-content: center;
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
}

.link-staff {
  color: var(--honey-primary);
  font-weight: 700;
  text-decoration: none;
}

/* Customer Content */
.bill-banner {
  background: #ffedd5;
  border-left: 4px solid #ea580c;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}

.bill-banner .bell-icon {
  font-size: 1.5rem;
  animation: ring 1.5s infinite;
}

@keyframes ring {
  0%, 100% { transform: rotate(0); }
  20%, 60% { transform: rotate(-15deg); }
  40%, 80% { transform: rotate(15deg); }
}

.bill-banner-text strong {
  display: block;
  font-size: 0.9rem;
  color: #9a3412;
}

.bill-banner-text span {
  font-size: 0.775rem;
  color: #c2410c;
}

.closed-banner {
  background: #f3f4f6;
  color: #4b5563;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
}

.hero-banner {
  background: linear-gradient(135deg, #78350f 0%, #b45309 60%, #d97706 100%);
  color: #ffffff;
  padding: 24px 18px;
  margin: 12px;
  border-radius: var(--radius-lg);
  box-shadow: 0 10px 25px rgba(180, 83, 9, 0.25);
}

.hero-subtitle {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fde68a;
  font-weight: 700;
}

.hero-title {
  font-size: 1.45rem;
  color: #ffffff;
  margin-top: 4px;
}

/* Tabs */
.tab-switcher {
  display: flex;
  margin: 0 12px 16px 12px;
  background: var(--bg-muted);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
}

.tab-btn {
  flex: 1;
  padding: 9px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: #ffffff;
  color: var(--honey-dark);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.catalog-section {
  padding: 0 12px 24px 12px;
}

.search-wrap {
  margin-bottom: 12px;
}

.search-input {
  border-radius: var(--radius-full);
  padding-left: 18px;
}

.category-pills {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 14px;
}

.cat-pill {
  padding: 6px 14px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: #ffffff;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-fast);
}

.cat-pill.active {
  background: var(--honey-primary);
  color: #ffffff;
  border-color: var(--honey-primary);
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
}

@media (max-width: 480px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
}

.loading-grid,
.empty-filter {
  text-align: center;
  padding: 40px 16px;
  color: var(--text-muted);
}

/* Floating Cart */
.cart-pill-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-pill-icon {
  position: relative;
  font-size: 1.5rem;
}

.cart-count-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-pill-text {
  display: flex;
  flex-direction: column;
}

.cart-pill-title {
  font-size: 0.75rem;
  color: #d1d5db;
}

.cart-pill-total {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  color: #fbbf24;
}

.btn-view-cart {
  padding: 7px 14px;
  border-radius: var(--radius-full);
  font-size: 0.825rem;
}
</style>
