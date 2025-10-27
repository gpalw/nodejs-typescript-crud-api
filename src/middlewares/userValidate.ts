import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { HttpError } from '../utils/errors';
import asyncHandler from '../utils/asyncHandler';

export const userValidate = (schema: ZodSchema) => asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
        const message = parsed.error.issues.map(i => i.message).join(', ');
        throw new HttpError(400, message);
    }

    req.body = parsed.data;

    next();
});