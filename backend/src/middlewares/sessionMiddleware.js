import prisma from '../config/prisma.js';

/**
 * Middleware untuk memvalidasi Table Session Token untuk pelanggan meja
 */
export const verifyTableSession = async (req, res, next) => {
  try {
    const sessionToken =
      req.headers['x-session-token'] ||
      req.headers['x-table-token'] ||
      req.query.token ||
      req.body.sessionToken ||
      req.params.token;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token sesi meja tidak disertakan.'
      });
    }

    const session = await prisma.tableSession.findUnique({
      where: { sessionToken: String(sessionToken) }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Sesi meja tidak ditemukan atau kode QR tidak valid.'
      });
    }

    if (session.status === 'CLOSED') {
      return res.status(403).json({
        success: false,
        message: 'Sesi meja ini telah ditutup oleh kasir.',
        session
      });
    }

    // Sematkan sesi meja ke request
    req.tableSession = session;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi sesi meja.',
      error: error.message
    });
  }
};
