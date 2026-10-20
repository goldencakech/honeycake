import crypto from 'crypto';
import prisma from '../config/prisma.js';

// Helper mapping untuk enum PaymentMethod Prisma
const normalizePaymentMethod = (method) => {
  if (!method) return null;
  const cleaned = String(method).trim().toUpperCase();
  if (cleaned.includes('BANK') || cleaned === 'M-BANKING') return 'MBANKING';
  if (cleaned.includes('WALLET') || cleaned === 'E-WALLET') return 'EWALLET';
  if (cleaned.includes('CASH') || cleaned === 'CASHIER') return 'CASHIER';
  return null;
};

/**
 * 1. Generate QR Code / New Table Session (Protected JWT: Staff / Admin)
 * POST /api/v1/tables/generate-qr
 */
export const generateQR = async (req, res, next) => {
  try {
    const { tableNumber } = req.body;

    if (!tableNumber || isNaN(Number(tableNumber))) {
      return res.status(400).json({
        success: false,
        message: 'Nomor meja (tableNumber) wajib diisi dengan format angka.'
      });
    }

    const num = parseInt(tableNumber, 10);

    // Tutup sesi aktif sebelumnya untuk nomor meja yang sama (jika ada) agar tidak terjadi konflik
    await prisma.tableSession.updateMany({
      where: {
        tableNumber: num,
        status: { in: ['ACTIVE', 'BILL_REQUESTED'] }
      },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    // Buat token unik acak yang aman
    const sessionToken = `hc-${num}-${crypto.randomBytes(8).toString('hex')}`;

    const newSession = await prisma.tableSession.create({
      data: {
        tableNumber: num,
        sessionToken,
        status: 'ACTIVE'
      }
    });

    const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const qrUrl = `${frontendBaseUrl}/?token=${sessionToken}`;

    return res.status(201).json({
      success: true,
      message: `Sesi meja #${num} berhasil dibuat.`,
      session: newSession,
      qrUrl
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Validasi Token Sesi Meja (Public)
 * GET /api/v1/tables/session/:token
 */
export const getSessionByToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Parameter token sesi meja wajib disertakan.'
      });
    }

    const session = await prisma.tableSession.findUnique({
      where: { sessionToken: token },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesi meja tidak ditemukan atau kode QR telah kadaluarsa.'
      });
    }

    // Hitung total tagihan dari semua order
    const totalBill = session.orders.reduce((acc, order) => acc + (order.subtotal || 0), 0);

    return res.status(200).json({
      success: true,
      session: {
        ...session,
        totalBill
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Request Bill (Protected Table Session Token)
 * POST /api/v1/tables/request-bill
 */
export const requestBill = async (req, res, next) => {
  try {
    const session = req.tableSession; // Didapat dari verifyTableSession middleware
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Metode pembayaran wajib dipilih (M-Banking, E-Wallet, atau Cashier).'
      });
    }

    const normalizedMethod = normalizePaymentMethod(paymentMethod);
    if (!normalizedMethod) {
      return res.status(400).json({
        success: false,
        message: 'Pilihan metode pembayaran tidak valid. Gunakan: M-Banking, E-Wallet, atau Cashier.'
      });
    }

    if (session.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Sesi meja ini sudah ditutup.'
      });
    }

    const updatedSession = await prisma.tableSession.update({
      where: { id: session.id },
      data: {
        status: 'BILL_REQUESTED',
        paymentMethod: normalizedMethod
      },
      include: {
        orders: true
      }
    });

    const totalBill = updatedSession.orders.reduce((acc, order) => acc + (order.subtotal || 0), 0);

    return res.status(200).json({
      success: true,
      message: 'Permintaan tagihan berhasil dikirimkan ke kasir. Mohon menunggu staf kami.',
      session: {
        ...updatedSession,
        totalBill
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Close Session Meja (Protected JWT: Staff / Admin)
 * PATCH /api/v1/tables/close-session/:id
 */
export const closeSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await prisma.tableSession.findUnique({
      where: { id }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesi meja tidak ditemukan.'
      });
    }

    if (session.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        message: 'Sesi meja ini sudah dalam status CLOSED sebelumnya.'
      });
    }

    const closed = await prisma.tableSession.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    });

    return res.status(200).json({
      success: true,
      message: `Sesi meja #${session.tableNumber} berhasil ditutup. Pembayaran selesai.`,
      session: closed
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Get Active / Bill Requested Sessions for Staff / Cashier (Protected JWT)
 * GET /api/v1/tables/active
 */
export const getActiveSessions = async (req, res, next) => {
  try {
    const sessions = await prisma.tableSession.findMany({
      where: {
        status: { in: ['ACTIVE', 'BILL_REQUESTED'] }
      },
      include: {
        orders: true
      },
      orderBy: { tableNumber: 'asc' }
    });

    const enriched = sessions.map((sess) => {
      const totalAmount = sess.orders.reduce((sum, ord) => sum + (ord.subtotal || 0), 0);
      const totalItems = sess.orders.reduce((sum, ord) => {
        const items = Array.isArray(ord.orderItems) ? ord.orderItems : [];
        return sum + items.reduce((iSum, itm) => iSum + (itm.quantity || 1), 0);
      }, 0);
      return {
        ...sess,
        totalAmount,
        totalItems,
        orderCount: sess.orders.length
      };
    });

    return res.status(200).json({
      success: true,
      sessions: enriched
    });
  } catch (error) {
    next(error);
  }
};
