// Main entry point for LogiTrack backend server
// Sets up Express server with Socket.io, middleware, and routes

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const logger = require('./config/logger');

// Initialize Express application
const app = express();
const server = http.createServer(app);

// Setup Socket.io for real-time communication
const setupSocket = require('./config/socket');
const io = setupSocket(server);
app.set('io', io); // Make io accessible in controllers via req.app.get('io')

// Socket.io authentication middleware - validates JWT token on connection
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

// Initialize Socket.io event handlers
const trackingHandler = require('./socket/trackingHandler');
const orderHandler = require('./socket/orderHandler');
io.on('connection', (socket) => {
  trackingHandler(io, socket);
  orderHandler(io, socket);
});

// Start background workers (BullMQ queue processors) - only if Redis available
require('./queues/assignmentWorker');
require('./queues/notificationWorker')(io);

// Global middleware setup
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use('/uploads', express.static('uploads')); // Serve delivery proof photos

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tracking', require('./routes/tracking'));

// Health check endpoint - useful for monitoring and debugging
app.get('/health', (req, res) => {
  const redisWrapper = require('./config/redis');
  const redisStatus = redisWrapper.isRedisAvailable() ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    services: {
      redis: redisStatus,
      database: 'unknown' // Would require actual DB ping
    }
  });
});

// Global error handler - catches all unhandled errors
app.use((err, req, res, next) => {
  logger.error('Unhandled Error:', err);
  res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// Start HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };