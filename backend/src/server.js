import app from './app.js';
import prisma from './config/prisma.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Validasi koneksi prisma opsional saat start up
    console.log('🐝 Menginisialisasi HoneyCake Backend Server...');
    
    app.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`🍯 HoneyCake API Server Aktif di Port ${PORT}`);
      console.log(`📡 URL API: http://localhost:${PORT}/api/v1`);
      console.log(`📋 Health Check: http://localhost:${PORT}/health`);
      console.log(`=========================================`);
    });
  } catch (error) {
    console.error('❌ Gagal menjalankan server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🛑 Prisma Client terputus. Server dimatikan.');
  process.exit(0);
});
