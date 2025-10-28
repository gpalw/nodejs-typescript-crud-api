import { Request, Response } from 'express';
import { termsService } from '../services/terms.service';
import asyncHandler from '../utils/asyncHandler';

export const termsController = {
    create: asyncHandler(async (req: Request, res: Response) => {
        const term = await termsService.createTerm(req.body);
        res.status(201).json(term);
    }),

    get: asyncHandler(async (req: Request, res: Response) => {
        const result = await termsService.getTerms();
        res.json(result);
    }),

};


