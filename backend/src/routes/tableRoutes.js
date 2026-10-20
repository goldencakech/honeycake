import express from 'express';
import {
  generateQR,
  getSessionByToken,
  requestBill,
  closeSession,
  getActiveSessions
} from '../controllers/tableController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { verifyTableSession } from '../middlewares/sessionMiddleware.js';

const router = express.Router();

// Protected JWT (Staff / Admin): Generate sesi meja baru & QR URL
router.post('/generate-qr', verifyJWT, generateQR);

// Public: Validasi token sesi meja (dipanggil saat pelanggan scan QR)
router.get('/session/:token', getSessionByToken);

// Protected Table Session Token: Pelanggan meminta tagihan dan memilih metode pembayaran
router.post('/request-bill', verifyTableSession, requestBill);

// Protected JWT (Staff / Admin / Kasir): Menutup sesi meja setelah pembayaran
router.patch('/close-session/:id', verifyJWT, closeSession);

// Protected JWT (Staff / Kasir): Mengambil seluruh sesi meja yang sedang aktif
router.get('/active', verifyJWT, getActiveSessions);

export default router;
