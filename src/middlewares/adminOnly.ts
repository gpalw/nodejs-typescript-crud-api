import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/errors';

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        next(new HttpError(403, 'Forbidden: Admin access required'));
    }
};