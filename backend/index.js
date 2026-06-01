require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./config/logger');

// Init Express App
const app = express();
const server = http.createServer(app);

// Setup Socket.io
const setupSocket = require('./config/socket');
const io = setupSocket(server);
app.set('io', io); // Make io accessible in controllers

// JWT auth for sockets
const jwt = require('jsonwebtoken');
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;
  if (!token) return next(new Error('Authentication error'));
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.user = decoded;
    next();
  });
});

// Setup Socket handlers
const trackingHandler = require('./socket/trackingHandler');
const orderHandler = require('./socket/orderHandler');
io.on('connection', (socket) => {
  trackingHandler(io, socket);
  orderHandler(io, socket);
});

// Setup Workers (only if Redis is available)
require('./queues/assignmentWorker');
require('./queues/notificationWorker')(io);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use('/uploads', express.static('uploads')); // serve proof photos

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));

// Health check endpoint
app.get('/health', (req, res) => {
  const redisWrapper = require('./config/redis');
  const redisStatus = redisWrapper.isRedisAvailable() ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus,
      database: 'unknown' // TODO: Add actual DB health check
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
