// Auth controller - handles user registration, login, and session management
// Uses bcrypt for password hashing and JWT for token-based auth

const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

class AuthController {
  // Register new user - creates account with hashed password
  static async register(req, res) {
    try {
      const { name, email, password, role = 'customer', phone } = req.body;

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists', code: 'USER_EXISTS' });
      }

      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user record
      const user = await User.create({
        name, email, passwordHash, role, phone
      });

      // Generate JWT tokens
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        accessToken
      });
    } catch (error) {
      // Handle database/API errors gracefully
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({ message: 'Service unavailable - database not connected', code: 'SERVICE_UNAVAILABLE' });
      }
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Login - authenticate user and return tokens
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      // Generate tokens
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      // Set refresh token cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        accessToken
      });
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        return res.status(503).json({ message: 'Service unavailable - database not connected', code: 'SERVICE_UNAVAILABLE' });
      }
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Logout - clear refresh token cookie
  static async logout(req, res) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }

  // Refresh - get new access token using refresh token
  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided', code: 'MISSING_REFRESH_TOKEN' });
      }

      // Verify refresh token
      let payload;
      try {
        payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
      } catch (err) {
        return res.status(401).json({ message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
      }

      // Get user and generate new access token
      const user = await User.findById(payload.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      res.json({ accessToken });
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Get current user profile
  static async me(req, res) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = AuthController;