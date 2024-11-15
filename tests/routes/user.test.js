// tests/routes/user.test.js

const request = require('supertest');
const app = require('../../server');
const User = require('../../models/user');

describe('User API', () => {
    beforeAll(async () => {
        await User.deleteMany({});
    });

    describe('Register and Login', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('username', 'testuser');
        });

        it('should login an existing user', async () => {
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({ email: 'testuser@example.com', password: 'password123' });

            console.log('Login response:', loginResponse.body);

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('message', 'Login successful');
            expect(loginResponse.body).toHaveProperty('token');
        });
    });
});