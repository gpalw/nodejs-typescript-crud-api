import { Router } from 'express';
import { termsController } from '../controllers/terms.controller';

const router = Router();

router.post('/', termsController.create);
router.get('/', termsController.get);


export default router;
