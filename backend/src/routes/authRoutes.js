import express from 'express';
import { login, getProfile } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public: Staff / Admin Login
router.post('/login', login);

// Protected: Get current user info
router.get('/me', verifyJWT, getProfile);

export default router;
