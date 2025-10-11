import request from 'supertest';
import { prisma } from '../db/prisma';
import app from '../app';

// --- Test Data ---
const testUser = {
    firstName: 'Auto',
    lastName: 'Test',
    email: 'autotest@example.com',
    password: 'Password123!',
};

const secondUser = {
    firstName: 'Second',
    lastName: 'User',
    email: 'second@example.com',
    password: 'Password123!',
};

describe('User API', () => {
    // Before each test, ensure the database is clean
    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });

    // After all tests, disconnect from the database
    afterAll(async () => {
        await prisma.$disconnect();
    });

    // =================================================================
    //  POST /users
    // =================================================================
    describe('POST /users', () => {
        it('should create a new user and return 201', async () => {
            const res = await request(app).post('/users').send(testUser);
            expect(res.status).toBe(201);
            expect(res.body.email).toBe(testUser.email);
            expect(res.body.password).toBeUndefined();
        });

        it('should return 409 when email already exists', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).post('/users').send({ ...testUser, firstName: 'Duplicate' });
            expect(res.status).toBe(409);
            expect(res.body.error).toMatch(/Email already exists/i);
        });

        it('should return 400 when password is too weak', async () => {
            const res = await request(app).post('/users').send({ ...testUser, password: '123' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Password must/i);
        });

        it('should return 400 when required fields are missing', async () => {
            const res = await request(app).post('/users').send({ firstName: 'A', lastName: 'B' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Invalid input/i);
        });
    });

    // =================================================================
    //  GET /users
    // =================================================================
    describe('GET /users', () => {
        it('should return a list of all users', async () => {
            await request(app).post('/users').send(testUser);
            await request(app).post('/users').send(secondUser);
            const res = await request(app).get('/users');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it('should return a single user by email', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).get('/users').query({ email: testUser.email });
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(testUser.email);
        });

        it('should return 404 for a non-existing email', async () => {
            const res = await request(app).get('/users').query({ email: 'ghost@example.com' });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/User not found/i);
        });
    });

    // =================================================================
    //  PATCH /users/:email
    // =================================================================
    describe('PATCH /users/:email', () => {
        it('should successfully update a user\'s firstName', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ firstName: 'Updated' });
            expect(res.status).toBe(200);
            expect(res.body.firstName).toBe('Updated');
        });

        it('should successfully update a user\'s lastName', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ lastName: 'Smith' });
            expect(res.status).toBe(200);
            expect(res.body.lastName).toBe('Smith');
        });

        it('should successfully update a user\'s email', async () => {
            await request(app).post('/users').send(testUser);
            const newEmail = 'new.email@example.com';
            const res = await request(app).patch(`/users/${testUser.email}`).send({ email: newEmail });
            expect(res.status).toBe(200);
            expect(res.body.email).toBe(newEmail);
        });

        it('should return 404 when trying to update a non-existing user', async () => {
            const res = await request(app).patch('/users/ghost@example.com').send({ firstName: 'No' });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/User not found/i);
        });

        it('should return 400 when update data has wrong type', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ email: 123 }); // email must be a string
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Invalid input/i);
        });

        it('should return 400 when the update payload is empty', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({});
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/No updatable fields provided/i);
        });

        it('should return 400 when trying to update disallowed fields', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ password: 'newPassword123!' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Only firstName, lastName, email can be updated/i);
        });

        it('should return 400 when firstName is updated to an empty string', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ firstName: '  ' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/First name cannot be empty/i);
        });

        it('should return 400 when lastName is updated to an empty string', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ lastName: '' });
            expect(res.status).toBe(400);
            expect(res.body.error).toMatch(/Last name cannot be empty/i);
        });

        it('should return 409 when new email already exists', async () => {
            await request(app).post('/users').send(testUser);
            await request(app).post('/users').send(secondUser);
            const res = await request(app).patch(`/users/${testUser.email}`).send({ email: secondUser.email });
            expect(res.status).toBe(409);
            expect(res.body.error).toMatch(/New email already exists/i);
        });
    });

    // =================================================================
    //  DELETE /users
    // =================================================================
    describe('DELETE /users', () => {
        it('should soft-delete a user and return 204', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).delete('/users').send({ email: testUser.email, password: testUser.password });
            expect(res.status).toBe(204);
        });

        it('should return 401 for incorrect password when deleting', async () => {
            await request(app).post('/users').send(testUser);
            const res = await request(app).delete('/users').send({ email: testUser.email, password: 'wrongpassword' });
            expect(res.status).toBe(401);
            expect(res.body.error).toMatch(/Invalid password/i);
        });

        it('should return 404 for a non-existing user', async () => {
            const res = await request(app).delete('/users').send({ email: 'ghost@example.com', password: 'any' });
            expect(res.status).toBe(404);
            expect(res.body.error).toMatch(/User not found/i);
        });

        it('should return 404 when trying to get a soft-deleted user', async () => {
            await request(app).post('/users').send(testUser);
            await request(app).delete('/users').send({ email: testUser.email, password: testUser.password });
            const res = await request(app).get('/users').query({ email: testUser.email });
            expect(res.status).toBe(404);
        });
    });
});

