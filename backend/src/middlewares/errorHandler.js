/**
 * Central Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * 404 Route Not Found Middleware
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rute API '${req.originalUrl}' tidak ditemukan.`
  });
};
