const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/user');

let token, userId;

beforeAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close(); // Close existing connection
    }
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    await User.deleteMany({}); // Clear users before each test
});

afterAll(async () => {
    await mongoose.connection.close(); // Close connection after all tests
});

describe('User API', () => {
    test('should register a new user', async () => {
        const response = await request(app)
            .post('/api/users/register')
            .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('username', 'testuser');
        userId = response.body.userId; // Save userId
    });

    test('should login the registered user', async () => {
        // First register the user
        await request(app)
            .post('/api/users/register')
            .send({ username: 'testuser', email: 'testuser@example.com', password: 'password123' });

        const response = await request(app)
            .post('/api/users/login')
            .send({ email: 'testuser@example.com', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login successful');
        token = response.body.token; // Save token for future tests
    });

    test('should retrieve the leaderboard for credits', async () => {
        const response = await request(app)
            .get('/api/users/leaderboard?metric=credits')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('leaderboard');
        expect(Array.isArray(response.body.leaderboard)).toBe(true);
    });

    test('should unlock achievements based on user progress', async () => {
        const response = await request(app)
            .post(`/api/users/${userId}/achievements`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(Array.isArray(response.body.achievements)).toBe(true);
    });

    test('should retrieve unlocked achievements', async () => {
        const response = await request(app)
            .get(`/api/users/${userId}/achievements`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('achievements');
        expect(Array.isArray(response.body.achievements)).toBe(true);
    });

    test('should update the user profile', async () => {
        const response = await request(app)
            .put(`/api/users/${userId}/profile`)
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'updateduser', preferredLeaderboard: ['credits', 'points'] });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Profile updated successfully');
        expect(response.body.user.preferredLeaderboard).toEqual(['credits', 'points']);
    });

    test('should retrieve the user profile', async () => {
        const response = await request(app)
            .get(`/api/users/${userId}/profile`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('username', 'updateduser');
    });
});