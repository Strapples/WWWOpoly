// tests/routes/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/user');

describe('User API', () => {
    beforeEach(async () => {
        await User.deleteMany({});
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('username', 'testuser');

        const savedUser = await User.findOne({ email: 'testuser@example.com' });
        console.log(`[Test] Stored hash for testuser@example.com: ${savedUser.password}`);
    });

    it('should login an existing user', async () => {
        await request(app)
            .post('/api/users/register')
            .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({ email: 'testuser@example.com', password: 'password123' });

        console.log('Login response:', loginResponse.body);
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');
    });
});