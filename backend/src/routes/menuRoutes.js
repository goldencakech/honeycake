import express from 'express';
import {
  getAllMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
} from '../controllers/menuController.js';
import { verifyJWT, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Menampilkan daftar seluruh menu
router.get('/', getAllMenus);

// Public: Menampilkan detail menu berdasarkan ID
router.get('/:id', getMenuById);

// Protected JWT (Admin only): Tambah menu baru
router.post('/', verifyJWT, requireAdmin, createMenu);

// Protected JWT (Admin only): Perbarui menu
router.put('/:id', verifyJWT, requireAdmin, updateMenu);

// Protected JWT (Admin only): Hapus menu
router.delete('/:id', verifyJWT, requireAdmin, deleteMenu);

export default router;
