const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

class AuthController {
  /**
   * Register a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      const { name, email, password, role = 'customer', phone } = req.body;

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists', code: 'USER_EXISTS' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({
        name,
        email,
        passwordHash,
        role,
        phone,
      });

      // Generate tokens
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return user and access token
      res.status(201).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        accessToken,
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
      }

      // Generate tokens
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
      const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return user and access token
      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
        accessToken,
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Logout user (clear refresh token cookie)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async logout(req, res) {
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
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
      } catch (error) {
        return res.status(401).json({ message: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' });
      }

      // Find user
      const user = await User.findById(payload.userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      // Generate new access token
      const accessToken = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });

      res.json({ accessToken });
    } catch (error) {
      console.error('Error in refresh:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object (should have req.user from auth middleware)
   * @param {Object} res - Express response object
   */
  static async me(req, res) {
    try {
      const userId = req.user.userId; // Set by auth middleware
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found', code: 'USER_NOT_FOUND' });
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error('Error in me:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = AuthController;