<template>
  <div class="dashboard-viewport">
    <Navbar />

    <div class="menu-page-header">
      <div>
        <h1 class="page-title">Kelola Menu Kafe (Admin)</h1>
        <p class="page-subtitle">Tambah, ubah, atau nonaktifkan menu kue, kopi, dan sajian HoneyCake.</p>
      </div>

      <button class="btn btn-primary" @click="openCreateModal">
        <span>➕ Tambah Menu Baru</span>
      </button>
    </div>

    <!-- Table of Menus -->
    <div class="card menu-table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Memuat daftar menu...</p>
      </div>

      <div v-else class="table-responsive">
        <table class="menu-table">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nama Menu</th>
              <th>Kategori</th>
              <th>Harga</th>
              <th>Status</th>
              <th class="text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in menus" :key="item.id">
              <td class="photo-cell">
                <img :src="item.imageUrl || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=120&auto=format&fit=crop&q=80'" :alt="item.name" class="table-thumb" />
              </td>
              <td>
                <div class="menu-main-info">
                  <strong class="item-name">{{ item.name }}</strong>
                  <span class="item-desc-snippet">{{ item.description }}</span>
                </div>
              </td>
              <td>
                <span class="category-pill">{{ item.category }}</span>
              </td>
              <td class="price-cell">
                {{ formatRupiah(item.price) }}
              </td>
              <td>
                <button
                  class="btn btn-sm btn-status-toggle"
                  :class="item.isAvailable ? 'available' : 'unavailable'"
                  @click="toggleAvailability(item)"
                >
                  {{ item.isAvailable ? 'Tersedia' : 'Habis' }}
                </button>
              </td>
              <td class="text-right actions-cell">
                <button class="btn btn-outline btn-sm" @click="openEditModal(item)">Edit</button>
                <button class="btn btn-danger btn-sm" @click="handleDelete(item.id, item.name)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="isModalOpen" class="modal-overlay" @click.self="isModalOpen = false">
      <div class="modal-content form-modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Menu' : 'Tambah Menu Baru' }}</h2>
          <button class="close-btn" @click="isModalOpen = false">&times;</button>
        </div>

        <form @submit.prevent="handleSubmitMenu" class="modal-body">
          <div class="form-group">
            <label class="form-label" for="menu-name">Nama Menu:</label>
            <input id="menu-name" v-model="form.name" type="text" class="form-control" required placeholder="Contoh: Basque Burnt Cheesecake" />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label" for="menu-category">Kategori:</label>
              <select id="menu-category" v-model="form.category" class="form-control" required>
                <option value="Signature Cakes">Signature Cakes</option>
                <option value="Coffee & Drinks">Coffee & Drinks</option>
                <option value="Savory Pastries">Savory Pastries</option>
                <option value="Tea & Refreshment">Tea & Refreshment</option>
              </select>
            </div>

            <div class="form-group flex-1">
              <label class="form-label" for="menu-price">Harga (IDR):</label>
              <input id="menu-price" v-model.number="form.price" type="number" min="0" step="1000" class="form-control" required placeholder="45000" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="menu-img">URL Gambar (Unsplash / Web):</label>
            <input id="menu-img" v-model="form.imageUrl" type="url" class="form-control" placeholder="https://images.unsplash.com/..." />
          </div>

          <div class="form-group">
            <label class="form-label" for="menu-desc">Deskripsi:</label>
            <textarea id="menu-desc" v-model="form.description" class="form-control" rows="3" placeholder="Deskripsi rasa dan bahan utama..."></textarea>
          </div>

          <div class="form-check-group">
            <label class="check-label">
              <input type="checkbox" v-model="form.isAvailable" />
              <span>Menu Siap Disajikan (Tersedia)</span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-outline" @click="isModalOpen = false">Batal</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">Menyimpan...</span>
              <span v-else>{{ isEditing ? 'Simpan Perubahan' : 'Buat Menu' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../../components/common/Navbar.vue';
import { menuApi } from '../../services/api';

const menus = ref([]);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const currentEditingId = ref(null);

const form = ref({
  name: '',
  category: 'Signature Cakes',
  price: 45000,
  imageUrl: '',
  description: '',
  isAvailable: true
});

const fetchMenus = async () => {
  isLoading.value = true;
  try {
    const res = await menuApi.getAllMenus();
    if (res.success) {
      menus.value = res.menus || [];
    }
  } catch (err) {
    console.error('Gagal mengambil daftar menu:', err);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  currentEditingId.value = null;
  form.value = {
    name: '',
    category: 'Signature Cakes',
    price: 45000,
    imageUrl: '',
    description: '',
    isAvailable: true
  };
  isModalOpen.value = true;
};

const openEditModal = (menu) => {
  isEditing.value = true;
  currentEditingId.value = menu.id;
  form.value = {
    name: menu.name,
    category: menu.category,
    price: menu.price,
    imageUrl: menu.imageUrl || '',
    description: menu.description || '',
    isAvailable: menu.isAvailable
  };
  isModalOpen.value = true;
};

const handleSubmitMenu = async () => {
  isSubmitting.value = true;
  try {
    if (isEditing.value && currentEditingId.value) {
      await menuApi.updateMenu(currentEditingId.value, form.value);
    } else {
      await menuApi.createMenu(form.value);
    }
    isModalOpen.value = false;
    await fetchMenus();
  } catch (err) {
    alert(err.message || 'Gagal menyimpan menu.');
  } finally {
    isSubmitting.value = false;
  }
};

const toggleAvailability = async (item) => {
  try {
    const updated = !item.isAvailable;
    await menuApi.updateMenu(item.id, { isAvailable: updated });
    item.isAvailable = updated;
  } catch (err) {
    alert(err.message || 'Gagal mengubah status ketersediaan.');
  }
};

const handleDelete = async (id, name) => {
  const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus menu "${name}"?`);
  if (!confirmed) return;

  try {
    await menuApi.deleteMenu(id);
    await fetchMenus();
  } catch (err) {
    alert(err.message || 'Gagal menghapus menu.');
  }
};

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(val || 0);
};

onMounted(() => {
  fetchMenus();
});
</script>

<style scoped>
.menu-page-header {
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

.menu-table-card {
  padding: 0;
  overflow: hidden;
}

.table-responsive {
  overflow-x: auto;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.menu-table th {
  background: var(--bg-muted);
  padding: 12px 16px;
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  border-bottom: 1px solid var(--border-subtle);
}

.menu-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.9rem;
  vertical-align: middle;
}

.photo-cell {
  width: 70px;
}

.table-thumb {
  width: 54px;
  height: 54px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.menu-main-info {
  display: flex;
  flex-direction: column;
}

.item-desc-snippet {
  font-size: 0.775rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-pill {
  display: inline-block;
  padding: 4px 10px;
  background: var(--bg-muted);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.price-cell {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  color: var(--honey-dark);
}

.btn-status-toggle {
  border-radius: var(--radius-full);
  font-weight: 700;
}

.btn-status-toggle.available {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.btn-status-toggle.unavailable {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fca5a5;
}

.actions-cell {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}

.text-right {
  text-align: right;
}

.form-modal {
  max-width: 500px;
}

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  font-size: 1.15rem;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 20px;
}

.form-row {
  display: flex;
  gap: 12px;
}

.flex-1 {
  flex: 1;
}

.form-check-group {
  margin: 16px 0;
}

.check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  cursor: pointer;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--border-subtle);
}

.loading-state {
  text-align: center;
  padding: 40px;
}
</style>
