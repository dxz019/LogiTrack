const request = require('supertest');
const { app, server } = require('../index');
const User = require('../models/User');
const Order = require('../models/Order');

// Set the port to a different one for testing
process.env.PORT = '5001';

describe('Auth System Integration Tests', () => {
  let testUser = {
    name: 'Test User System',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer',
    phone: '1234567890',
  };

  let accessToken;
  let createdUserId;

  afterAll(async () => {
    // Clean up: delete the test user if created
    if (createdUserId) {
      try {
        await User.deleteById(createdUserId);
      } catch (err) {
        // User might already be deleted or not exist
      }
    }
    // Close the server
    server.close();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
    createdUserId = res.body.user.id;
  });

  it('should login the user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.headers).toHaveProperty('set-cookie');
    accessToken = res.body.accessToken;
  });

  it('should return the current user', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  it('should fail to access protected route with invalid token', async () => {
    await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401);
  });
});