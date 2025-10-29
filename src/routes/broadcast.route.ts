// src/routes/broadcast.route.ts
import { Router } from 'express';
import { broadcastController } from '../controllers/broadcast.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/adminOnly';

const router = Router();

router.post(
    '/',
    authMiddleware,
    adminOnly,
    broadcastController.send
);

export default router;