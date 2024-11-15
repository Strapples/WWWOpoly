// tests/routes/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');

describe('User API', () => {
    let server;

    beforeAll(async () => {
        // Start the server and ensure MongoDB is connected
        server = await app.listen(51242);
        await mongoose.connection.asPromise(); // Wait until MongoDB is connected
        console.log("Connected to MongoDB for tests");
    });

    afterAll(async () => {
        // Close the server and MongoDB connection
        await server.close();
        await mongoose.connection.close();
    });

    it('should register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            });

        console.log('Register response:', response.body); // Log for debugging
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('username', 'testuser');
    }, 20000); // Increased timeout

    it('should login an existing user', async () => {
        const response = await request(app)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        console.log('Login response:', response.body); // Log for debugging
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    }, 20000); // Increased timeout
});