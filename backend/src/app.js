import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

// Konfigurasi CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Izinkan request tanpa origin (seperti curl, mobile app, postman) atau origin dalam daftar
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive untuk kemudahan testing local development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token', 'x-table-token']
  })
);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root & Health Check Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'HoneyCake Smart Self-Ordering Cafe API',
    version: '1.0.0',
    status: 'Running'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routing API v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tables', tableRoutes);
app.use('/api/v1/menus', menuRoutes);
app.use('/api/v1/orders', orderRoutes);

// 404 dan Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
