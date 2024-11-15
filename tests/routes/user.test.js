// tests/routes/user.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/user'); // Import the User model

describe('User API', () => {
    let server;

    beforeAll((done) => {
        // Start the server for testing
        server = app.listen(51242, () => done()); // Use a different port for testing
    });

    afterAll(async () => {
        // Close the server and MongoDB connection
        await server.close();
        await mongoose.connection.close(); // Updated to remove callback
    });

    beforeEach(async () => {
        // Clear the users collection before each test to ensure isolation
        await User.deleteMany({});
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
        expect(response.body).toHaveProperty('message', 'User registered successfully');
    }, 20000); // Increased timeout

    it('should login an existing user', async () => {
        // Register a user first via the API
        const registerResponse = await request(app)
            .post('/api/users/register')
            .send({
                username: 'testuser',
                email: 'testuser@example.com',
                password: 'password123'
            });
        
        console.log('Register response:', registerResponse.body); // Log for debugging
        expect(registerResponse.status).toBe(201);

        // Attempt to log in with the same credentials
        const loginResponse = await request(app)
            .post('/api/users/login')
            .send({
                email: 'testuser@example.com',
                password: 'password123'
            });

        console.log('Login response:', loginResponse.body); // Log for debugging
        expect(loginResponse.status).toBe(200);
        expect(loginResponse.body).toHaveProperty('token');
    }, 20000); // Increased timeout
});