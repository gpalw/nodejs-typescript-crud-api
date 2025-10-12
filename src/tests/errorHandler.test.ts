import { errorHandler } from '../middlewares/errorHandler';
import { HttpError } from '../utils/errors';
import { Request, Response, NextFunction } from 'express';

// Mock Express req, res, and next objects for unit testing
const mockRequest = {} as Request;
const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

describe('Error Handler Middleware', () => {

    // Reset mocks before each test to ensure isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // === Test Case 1: The ideal scenario ===
    // Covers: err.status and err.message (the left-hand side of the || operator)
    it('should handle HttpError with custom status and message', () => {
        const error = new HttpError(404, 'User not found');
        errorHandler(error, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    // === Test Case 2: Missing status property ===
    // Covers: || 500 (the right-hand side of the statusCode assignment)
    // Covers: err.message (the left-hand side of the message assignment)
    it('should handle standard Error with default status 500', () => {
        const error = new Error('Database connection failed');
        errorHandler(error, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });

    // === Test Case 3: Missing message property ===
    // Covers: || 500 (the right-hand side of the statusCode assignment)
    // Covers: || 'Internal Server Error' (the right-hand side of the message assignment)
    it('should handle an unknown thrown object with default status and message', () => {
        // Create an object that has neither a .status nor a .message property
        const unknownError = {};
        errorHandler(unknownError, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});
