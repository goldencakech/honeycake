import express from 'express';
import {
  createOrder,
  getOrdersByTableToken,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { verifyTableSession } from '../middlewares/sessionMiddleware.js';

const router = express.Router();

// Protected Table Session Token: Pelanggan membuat pesanan baru
router.post('/', verifyTableSession, createOrder);

// Protected Table Session Token: Pelanggan melihat riwayat & status pesanan meja mereka
router.get('/table/:token', verifyTableSession, getOrdersByTableToken);

// Protected JWT (Staff / Kitchen): Mengambil seluruh pesanan untuk Kanban board
router.get('/', verifyJWT, getAllOrders);

// Protected JWT (Staff / Kitchen): Mengubah status pesanan (Pending -> Preparing -> Ready -> Delivered)
router.patch('/:id/status', verifyJWT, updateOrderStatus);

export default router;
