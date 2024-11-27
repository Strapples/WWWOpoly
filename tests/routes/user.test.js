const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../server');
const User = require('../../models/user');
const Achievement = require('../../models/Achievement');

// Helper function to hash passwords
const hashPassword = (password) => {
    const salt = process.env.SALT || 'default_salt';
    return require('crypto').createHash('sha256').update(password + salt).digest('hex');
};

let token, userId;

beforeAll(async () => {
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    await mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

beforeEach(async () => {
    // Ensure a clean database before each test
    await mongoose.connection.dropDatabase();

    // Create test user
    const testUser = await User.create({
        username: 'testuser',
        email: 'testuser@example.com',
        password: hashPassword('password123'),
    });

    userId = testUser._id;
    token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Create test achievement
    await Achievement.create({
        id: 'first_login',
        title: 'First Login',
        description: 'Log into the system for the first time.',
        user: testUser._id, // Associate the achievement with the created user
        unlockedAt: new Date(),
    });
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe('User API', () => {
    test('should register a new user', async () => {
        expect(userId).toBeDefined();
    });

    test('should login the registered user', async () => {
        expect(token).toBeDefined();
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