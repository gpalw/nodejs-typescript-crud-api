import { Router } from 'express';
import { userController } from '../controllers/user.controller';

const router = Router();

router.post('/', userController.create);
router.get('/', userController.get);
router.patch('/:email', userController.update);
router.delete('/', userController.delete);

export default router;
