jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../config/db');

process.env.JWT_SECRET = 'testSecret';
process.env.JWT_REFRESH_SECRET = 'testRefreshSecret';

const authController = require('../controllers/authController');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('AuthController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      headers: {},
      cookies: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      req.body = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
        phone: '1234567890',
      };

      User.findByEmail.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue({
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        phone: '1234567890',
      });
      jwt.sign.mockImplementation((payload, secret, options) => {
        if (options.expiresIn === '15m') return 'accessToken';
        if (options.expiresIn === '30d') return 'refreshToken';
      });

      await authController.register(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        role: 'customer',
        phone: '1234567890',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          phone: '1234567890',
        },
        accessToken: 'accessToken',
      });
    });

    it('should return 400 if user already exists', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      User.findByEmail.mockResolvedValue({ id: '1' });

      await authController.register(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
        code: 'USER_EXISTS',
      });
    });
  });

  describe('login', () => {
    it('should login a user with correct credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
        name: 'Test User',
        role: 'customer',
        phone: '1234567890',
      };
      User.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockImplementation((payload, secret, options) => {
        if (options.expiresIn === '15m') return 'accessToken';
        if (options.expiresIn === '30d') return 'refreshToken';
      });

      await authController.login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          phone: '1234567890',
        },
        accessToken: 'accessToken',
      });
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        })
      );
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const user = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashedPassword',
      };
      User.findByEmail.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(false);

      await authController.login(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    });
  });

  describe('logout', () => {
    it('should clear the refresh token cookie', async () => {
      await authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
      expect(res.json).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });

  describe('refresh', () => {
    it('should refresh the access token', async () => {
      req.cookies = { refreshToken: 'validRefreshToken' };
      const user = { id: '1', role: 'customer' };
      jwt.verify.mockImplementation((token, secret) => {
        if (token === 'validRefreshToken' && secret === process.env.JWT_REFRESH_SECRET) {
          return { userId: '1' };
        }
      });
      User.findById.mockResolvedValue(user);
      jwt.sign.mockReturnValue('newAccessToken');

      await authController.refresh(req, res);

      expect(jwt.verify).toHaveBeenCalledWith('validRefreshToken', process.env.JWT_REFRESH_SECRET);
      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ accessToken: 'newAccessToken' });
    });

    it('should return 401 if refresh token is missing', async () => {
      req.cookies = {};

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Refresh token not provided',
        code: 'MISSING_REFRESH_TOKEN',
      });
    });

    it('should return 401 if refresh token is invalid', async () => {
      req.cookies = { refreshToken: 'invalidToken' };
      jwt.verify.mockImplementation(() => {
        throw new Error();
      });

      await authController.refresh(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN',
      });
    });
  });

  describe('me', () => {
    it('should return the current user', async () => {
      req.user = { userId: '1' };
      const user = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
        phone: '1234567890',
      };
      User.findById.mockResolvedValue(user);

      await authController.me(req, res);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'customer',
          phone: '1234567890',
        },
      });
    });

    it('should return 404 if user not found', async () => {
      req.user = { userId: '1' };
      User.findById.mockResolvedValue(null);

      await authController.me(req, res);

      expect(User.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    });
  });
});
