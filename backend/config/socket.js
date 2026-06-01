const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const JWT_SECRET = process.env.JWT_SECRET;

// Socket.io server setup
function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware for socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      const decoded = await promisify(jwt.verify)(token, JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id, 'User:', socket.userId);

    // Import and initialize handlers
    const trackingHandler = require('./trackingHandler');
    const orderHandler = require('./orderHandler');

    trackingHandler(io, socket);
    orderHandler(io, socket);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id, 'User:', socket.userId);
    });
  });

  return io;
}

module.exports = setupSocket;