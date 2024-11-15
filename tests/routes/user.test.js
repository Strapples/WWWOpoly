// tests/routes/user.test.js
const request = require('supertest');
const app = require('../../server'); // Path to your Express app
jest.mock('../../utils/cronjobs');

describe('User API', () => {
    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    it('should login an existing user', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successful');
    });
});