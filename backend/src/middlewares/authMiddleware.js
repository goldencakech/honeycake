import jwt from 'jsonwebtoken';

/**
 * Middleware untuk memvalidasi JWT token staff/admin
 */
export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Akses ditolak. Token otorisasi tidak ditemukan.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'honeycake-super-secret-jwt-key-2026');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kadaluarsa.',
      error: error.message
    });
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan role (admin/staff)
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses terlarang. Anda tidak memiliki izin untuk tindakan ini.'
      });
    }
    next();
  };
};

export const requireAdmin = requireRole('admin');
