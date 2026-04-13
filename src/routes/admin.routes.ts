import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../middlewares/auth';
import {
  createCategory,
  deleteCategory,
  getAdminDashboard,
  getAllOrders,
  getCategories,
  getUsers,
  updateCategory,
  updateUserStatus,
} from '../controllers/admin.controller';

const router = Router();

router.use(auth(Role.ADMIN));
router.get('/dashboard', getAdminDashboard);
router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/orders', getAllOrders);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;
