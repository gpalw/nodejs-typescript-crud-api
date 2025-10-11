import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import asyncHandler from '../utils/asyncHandler';

export const userController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
        const email = req.query.email as string | undefined;
        const result = await userService.getUsers(email);
        res.json(result);
    }),

    update: asyncHandler(async (req: Request, res: Response) => {
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


