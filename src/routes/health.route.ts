import { Router } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

router.get('/', async (_req, res) => {

    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true });
});

export default router;
