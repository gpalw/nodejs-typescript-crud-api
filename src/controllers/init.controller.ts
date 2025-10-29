// src/controllers/init.controller.ts
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { userService } from '../services/user.service';
import { HttpError } from '../utils/errors';

export const initController = {
    seedUsers: asyncHandler(async (req: Request, res: Response) => {
        // /seed-users?count=50
        const count = Number(req.query.count) || 50;

        if (count > 100) {
            throw new HttpError(400, 'Cannot seed more than 100 users at a time');
        }

        const result = await userService.createDemoUsers(count);

        res.status(201).json({
            message: `Successfully created ${result.count} demo users.`,
            defaultPassword: 'Password123!'
        });
    })
};