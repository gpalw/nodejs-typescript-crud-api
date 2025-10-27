import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { userValidate } from '../middlewares/userValidate';


const router = Router();

router.post('/login', userController.login);

router.post('/', userValidate(createUserSchema), userController.create);
router.get('/', userController.get);
router.patch('/:email', userValidate(updateUserSchema), userController.update);
router.delete('/', userController.delete);

export default router;


