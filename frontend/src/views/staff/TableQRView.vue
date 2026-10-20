<template>
  <div class="dashboard-viewport">
    <Navbar />

    <div class="page-header">
      <div>
        <h1 class="page-title">Generator QR Code Meja</h1>
        <p class="page-subtitle">Buat kode QR baru untuk setiap meja pelanggan agar dapat memesan secara mandiri.</p>
      </div>
    </div>

    <div class="qr-layout">
      <!-- Input Card -->
      <div class="card form-card">
        <h2 class="card-title">1. Masukkan Nomor Meja</h2>
        <p class="card-desc">Setiap pembuatan QR baru akan secara otomatis memperbarui sesi meja menjadi ACTIVE.</p>

        <form @submit.prevent="handleGenerateQR">
          <div class="form-group">
            <label class="form-label" for="table-num">Nomor Meja:</label>
            <input
              id="table-num"
              v-model.number="tableNumber"
              type="number"
              min="1"
              max="99"
              class="form-control"
              placeholder="Contoh: 1, 2, 5, 12..."
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isGenerating || !tableNumber">
            <span v-if="isGenerating">Membuat Kode QR...</span>
            <span v-else>Generate QR Meja #{{ tableNumber || '' }}</span>
          </button>
        </form>

        <!-- Quick Table Chips -->
        <div class="quick-tables">
          <span class="quick-title">Pilih Cepat Meja:</span>
          <div class="chips-wrap">
            <button
              v-for="num in [1, 2, 3, 4, 5, 6, 7, 8]"
              :key="num"
              type="button"
              class="chip-btn"
              :class="{ selected: tableNumber === num }"
              @click="tableNumber = num"
            >
              Meja {{ num }}
            </button>
          </div>
        </div>
      </div>

      <!-- QR Preview Card -->
      <div class="card preview-card">
        <h2 class="card-title">2. Pratinjau QR Code Meja</h2>

        <div v-if="qrDataUrl" class="qr-printable-box" id="printable-qr">
          <div class="qr-table-header">
            <span class="qr-cafe-name">🍯 HONEYCAKE SMART CAFÉ</span>
            <span class="qr-table-badge">MEJA {{ generatedSession?.tableNumber }}</span>
          </div>

          <div class="qr-canvas-wrap">
            <img :src="qrDataUrl" alt="Table QR Code" class="qr-image" />
          </div>

          <div class="qr-footer-hint">
            <span>Pindai kamera HP Anda untuk memesan kue & minuman</span>
            <small class="token-text">Token: {{ generatedSession?.sessionToken }}</small>
          </div>
        </div>

        <div v-else class="qr-placeholder">
          <div class="placeholder-icon">📷</div>
          <p>Masukkan nomor meja di sebelah kiri dan klik <strong>Generate QR</strong> untuk melihat tampilan kode QR meja.</p>
        </div>

        <!-- Action Buttons when QR is ready -->
        <div v-if="qrDataUrl" class="qr-action-buttons">
          <button class="btn btn-outline btn-sm" @click="copyCustomerUrl">
            <span>📋 {{ isCopied ? 'Tersalin!' : 'Salin Tautan' }}</span>
          </button>
          <a :href="customerUrl" target="_blank" class="btn btn-secondary btn-sm">
            <span>🚀 Buka Web Tamu</span>
          </a>
          <button class="btn btn-primary btn-sm" @click="printQR">
            <span>🖨️ Cetak QR</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QRCode from 'qrcode';
import Navbar from '../../components/common/Navbar.vue';
import { tableApi } from '../../services/api';

const tableNumber = ref(1);
const isGenerating = ref(false);
const qrDataUrl = ref('');
const customerUrl = ref('');
const generatedSession = ref(null);
const isCopied = ref(false);

const handleGenerateQR = async () => {
  if (!tableNumber.value) return;
  isGenerating.value = true;
  try {
    const res = await tableApi.generateQR(tableNumber.value);
    if (res.success && res.session) {
      generatedSession.value = res.session;
      customerUrl.value = res.qrUrl;

      // Generate Data URL QR Code
      qrDataUrl.value = await QRCode.toDataURL(res.qrUrl, {
        width: 260,
        margin: 2,
        color: {
          dark: '#1f1b16',
          light: '#ffffff'
        }
      });
    }
  } catch (error) {
    alert(error.message || 'Gagal menghasilkan QR code.');
  } finally {
    isGenerating.value = false;
  }
};

const copyCustomerUrl = async () => {
  if (!customerUrl.value) return;
  try {
    await navigator.clipboard.writeText(customerUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (e) {
    alert(`URL Meja: ${customerUrl.value}`);
  }
};

const printQR = () => {
  window.print();
};
</script>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.6rem;
  color: var(--honey-dark);
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.qr-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 860px) {
  .qr-layout {
    grid-template-columns: 1fr;
  }
}

.card-title {
  font-size: 1.15rem;
  margin-bottom: 6px;
}

.card-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 20px;
}

.quick-tables {
  margin-top: 24px;
  border-top: 1px solid var(--border-subtle);
  padding-top: 16px;
}

.quick-title {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--text-muted);
  display: block;
  margin-bottom: 8px;
}

.chips-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip-btn {
  padding: 6px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: var(--bg-muted);
  font-size: 0.825rem;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn.selected,
.chip-btn:hover {
  background: var(--honey-primary-light);
  border-color: var(--honey-primary);
  color: var(--honey-dark);
}

/* Printable QR Box */
.qr-printable-box {
  background: #ffffff;
  border: 2px dashed var(--honey-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  max-width: 320px;
  margin: 0 auto 20px auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.qr-cafe-name {
  display: block;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--honey-primary);
}

.qr-table-badge {
  display: inline-block;
  font-family: 'Outfit', sans-serif;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 4px 0 12px 0;
}

.qr-canvas-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.qr-image {
  width: 220px;
  height: 220px;
  border-radius: var(--radius-sm);
}

.qr-footer-hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.token-text {
  font-size: 0.65rem;
  color: var(--text-light);
  word-break: break-all;
}

.qr-placeholder {
  padding: 50px 20px;
  text-align: center;
  color: var(--text-muted);
}

.placeholder-icon {
  font-size: 3rem;
  margin-bottom: 12px;
}

.qr-action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Print CSS */
@media print {
  body * {
    visibility: hidden;
  }
  #printable-qr, #printable-qr * {
    visibility: visible;
  }
  #printable-qr {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    border: 2px solid #000;
  }
}
</style>
