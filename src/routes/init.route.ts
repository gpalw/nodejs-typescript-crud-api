// src/routes/init.route.ts
import { Router } from 'express';
import { initController } from '../controllers/init.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

router.post(
    '/seed-users',
    authMiddleware,
    adminOnly,
    initController.seedUsers
);

export default router;