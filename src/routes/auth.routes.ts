import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { getMe, login, register } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth(), getMe);

export default router;
