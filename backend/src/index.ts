import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';

import router from './routes/AuthRoute.js';
import router1 from './routes/AdminRoute.js';
import { SocketAuth } from './middlewares/SocketAuth.js';
import errorMiddleware from './middlewares/errorMiddleware.js';
import config from './config/config.js';
import { Request, Response, NextFunction } from 'express';
import { Socket } from 'socket.io';

const PORT = config.port;
const app = express();

// Security and Performance Middlewares
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compress response bodies for better performance

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter); // Apply rate limit to all /api routes

app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Environment
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined')); // Production-grade logging
}

/* ======================
   BASIC ROUTE
====================== */
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy', message: 'HRM API Server' });
});

/* ======================
   ROUTES
====================== */
app.use('/api/auth', router);
app.use('/api/admin', router1);

// Standard Error Handler (Always last)
app.use(errorMiddleware);

/* ======================
   SOCKET.IO SETUP
====================== */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: config.frontendUrl,
    credentials: true,
  },
});

// 🔐 socket auth
io.use(SocketAuth);

// Attach io to requests
app.use((req: Request, res: Response, next: NextFunction) => {
  req.io = io;
  next();
});

/* ======================
   SOCKET EVENTS
====================== */
io.on('connection', (socket: Socket) => {
  if (config.env === 'development') {
    console.log('🟢 Socket connected:', socket.id);
  }

  socket.on('join', () => {
    if (socket.user?.id) {
      socket.join(socket.user.id);
    }
  });

  socket.on('disconnect', () => {
    if (config.env === 'development') {
      console.log('🔴 Socket disconnected:', socket.id);
    }
  });
});

/* ======================
   SERVER START & GRACEFUL SHUTDOWN
====================== */
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${config.env} mode`);
});

// Graceful Shutdown Handler
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
