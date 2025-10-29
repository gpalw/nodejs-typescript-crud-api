import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { userValidate } from '../middlewares/userValidate';
import { authMiddleware } from '../middlewares/auth.middleware';
import { adminOnly } from '../middlewares/adminOnly';


const router = Router();

router.post('/login', userController.login);

router.post('/', userValidate(createUserSchema), userController.create);
router.get('/', authMiddleware, userController.get);
router.patch('/:email', authMiddleware, userValidate(updateUserSchema), userController.update);
router.delete('/', authMiddleware, adminOnly, userController.delete);

export default router;


