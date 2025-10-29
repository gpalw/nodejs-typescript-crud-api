import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HttpError } from '../utils/errors';
import asyncHandler from '../utils/asyncHandler';
import { UserPayload } from '../types/auth.types';



export const authMiddleware = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;

    // Check whether the Header exists and is in the correct format (Bearer...)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new HttpError(401, 'Unauthorized: No token provided or invalid format');
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN_STRING" -> "TOKEN_STRING"

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            // This is an internal server error
            throw new Error('Server misconfiguration: JWT_SECRET is not defined');
        }

        // Verify Token. If the signature is invalid or expired, an error will be thrown here
        const payload = jwt.verify(token, secret) as UserPayload;

        req.user = payload;

        next();

    } catch (error) {
        throw new HttpError(401, 'Unauthorized: Invalid or expired token');
    }
});