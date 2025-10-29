import { Router } from 'express';
import { termsController } from '../controllers/terms.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, termsController.create);
router.get('/', authMiddleware, termsController.get);


export default router;
