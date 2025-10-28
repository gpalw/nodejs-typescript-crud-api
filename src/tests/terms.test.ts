import request from 'supertest';
import { prisma } from '../db/prisma';
import app from '../app';

// --- Test Data ---
const testTerm = {
    author: 'Auto Test Author',
    content: 'Ccontent.',
    createdAt: new Date(),
    updatedAt: new Date(),
};


describe('Terms API', () => {
    // Before each test, ensure the database is clean
    beforeEach(async () => {
        await prisma.terms.deleteMany({});
    });

    // After all tests, disconnect from the database
    afterAll(async () => {
        await prisma.$disconnect();
    });

    // =================================================================
    //  POST /terms
    // =================================================================
    describe('POST /terms', () => {
        it('should create a new term and return 201', async () => {
            const res = await request(app).post('/terms').send(testTerm);
            expect(res.status).toBe(201);
            expect(res.body.author).toBe(testTerm.author);
            expect(res.body.content).toBe(testTerm.content);
        });
    });

    // =================================================================
    //  GET /terms
    // =================================================================
    describe('GET /terms', () => {
        it('should return a list of all terms', async () => {
            await request(app).post('/terms').send(testTerm);
            const res = await request(app).get('/terms');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(1);
        });
    });
});

