
import { errorHandler } from '../middlewares/errorHandler';
import { HttpError } from '../utils/errors';
import { Request, Response, NextFunction } from 'express';

// 模拟 Express 的 req, res, next 对象
const mockRequest = {} as Request;
const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
} as unknown as Response;
const mockNext = jest.fn() as NextFunction;

describe('Error Handler Middleware', () => {

    // 在每个测试后重置 mock 函数的调用记录
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // === 测试场景 1: 完美情况 ===
    // 覆盖: err.status 和 err.message (|| 的左分支)
    it('should handle HttpError with custom status and message', () => {
        const error = new HttpError(404, 'User not found');
        errorHandler(error, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'User not found' });
    });

    // === 测试场景 2: 缺少 status 的情况 ===
    // 覆盖: || 500 (statusCode 的右分支)
    // 覆盖: err.message (message 的左分支)
    it('should handle standard Error with default status 500', () => {
        const error = new Error('Database connection failed');
        errorHandler(error, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Database connection failed' });
    });

    // === 测试场景 3: 缺少 message 的情况 (这是您缺少的关键测试！) ===
    // 覆盖: || 500 (statusCode 的右分支)
    // 覆盖: || 'Internal Server Error' (message 的右分支)
    it('should handle an unknown thrown object with default status and message', () => {
        // 创建一个既没有 .status 也没有 .message 的对象
        const unknownError = {};
        errorHandler(unknownError, mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
    });
});