const request = require('supertest');
const app = require('../../server'); // Adjust based on your server entry file
const mongoose = require('mongoose');

describe('User API', () => {
    let token;
    let userId;

    beforeAll(async () => {
        // Connect to a test database or setup connection as needed
        await mongoose.connect(process.env.MONGO_URI_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        // Disconnect from the database after all tests
        await mongoose.connection.close();
    });

    describe('Register and Login', () => {
        it('should register a new user', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('username', 'testuser');
            userId = response.body._id; // Save user ID for future use
        });

        it('should login the registered user', async () => {
            const loginResponse = await request(app)
                .post('/api/users/login')
                .send({ email: 'testuser@example.com', password: 'password123' });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body).toHaveProperty('message', 'Login successful');
            expect(loginResponse.body).toHaveProperty('token');
            token = loginResponse.body.token; // Save token for authenticated routes
        });
    });

    describe('Leaderboard', () => {
        it('should retrieve the leaderboard for credits', async () => {
            const response = await request(app)
                .get('/api/users/leaderboard?metric=credits')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('leaderboard');
            expect(Array.isArray(response.body.leaderboard)).toBe(true);
        });
    });

    describe('Achievements', () => {
        it('should unlock an achievement for the user', async () => {
            const response = await request(app)
                .post(`/api/users/${userId}/achievements`)
                .send({ title: 'First Login', description: 'Achieved first login.' })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Achievement unlocked');
        });
    });

    describe('Profile Management', () => {
        it('should update the user profile', async () => {
            const response = await request(app)
                .put(`/api/users/${userId}/profile`)
                .send({ preferredLeaderboard: ['credits', 'points'] })
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Profile updated successfully');
            expect(response.body.user.preferredLeaderboard).toEqual(['credits', 'points']);
        });

        it('should retrieve the user profile', async () => {
            const response = await request(app)
                .get(`/api/users/${userId}/profile`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('user');
            expect(response.body.user).toHaveProperty('username', 'testuser');
        });
    });
});