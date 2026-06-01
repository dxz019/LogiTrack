const request = require('supertest');
const { server } = require('../index');
const User = require('../models/User');

// Set the port to a different one for testing to avoid conflicts
process.env.PORT = '5001';
// We'll use the same database but we'll clean up after ourselves

describe('Auth System Tests', () => {
  let testUser = {
    name: 'Test User System',
    email: `test_${Date.now()}@example.com`,
    password: 'password123',
    role: 'customer',
    phone: '1234567890',
  };

  let accessToken;
  let refreshToken;

  afterAll(async () => {
    // Clean up: delete the test user
    await User.deleteMany({ email: testUser.email }).exec();
    // Close the server
    server.close();
  });

  it('should register a new user', async () => {
    const res = await request(server)
      .post('/api/auth/register')
      .send(testUser)
      .expect(201);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
  });

  it('should login the user', async () => {
    const res = await request(server)
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
    // Extract the refresh token from the cookie
    const cookie = res.headers['set-cookie'].find(c => c.startsWith('refreshToken='));
    if (cookie) {
      refreshToken = cookie.split(';')[0].split('=')[1];
    }
  });

  it('should return the current user', async () => {
    const res = await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toHaveProperty('email', testUser.email);
  });

  it('should refresh the access token', async () => {
    const res = await request(server)
      .post('/api/auth/refresh')
      .send()
      .expect(200);

    expect(res.body).toHaveProperty('accessToken');
    accessToken = res.body.accessToken;
  });

  it('should logout the user', async () => {
    const res = await request(server)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('message', 'Logged out successfully');
  });

  it('should fail to access protected route after logout', async () => {
    await request(server)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(401);
  });
});
