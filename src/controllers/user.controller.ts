import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import asyncHandler from '../utils/asyncHandler';
import { UserQueryOptions } from '../types/user.types';
import { HttpError } from '../utils/errors';

export const userController = {
    login: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new HttpError(400, 'Email and password are required');
        }

        const token = await userService.loginUser(email, password);

        res.json({ token });
    }),

    create: asyncHandler(async (req: Request, res: Response) => {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
        const queryOptions: UserQueryOptions = {
            email: req.query.email as string | undefined,
            firstName: req.query.firstName as string | undefined,
            lastName: req.query.lastName as string | undefined,
            pagination: {
                page: req.query.page ? Number(req.query.page) : 1,
                limit: req.query.limit ? Number(req.query.limit) : 10,
            },
        };

        const result = await userService.getUsers(queryOptions);
        res.json(result);
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
        if (!req.user) {
            throw new HttpError(401, 'Unauthorized user is empty');
        }
        if (req.user.email !== req.params.email && req.user.role !== 'admin') {
            throw new HttpError(403, 'Forbidden: You can only update your own account');
        }
        const email = req.params.email;
        const updated = await userService.updateUser(email, req.body);
        res.json(updated);
    }),

    delete: asyncHandler(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        await userService.deleteUser(email, password);
        res.status(204).send();
    }),
};


