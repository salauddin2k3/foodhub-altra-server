import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../middlewares/auth';
import { getProviderById, getProviderDashboard, getProviderOrders, getProviders, updateProviderOrderStatus } from '../controllers/provider.controller';

const router = Router();

router.get('/', getProviders);
router.get('/:id', getProviderById);
router.get('/dashboard/me', auth(Role.PROVIDER), getProviderDashboard);
router.get('/dashboard/orders/me', auth(Role.PROVIDER), getProviderOrders);
router.patch('/dashboard/orders/:id/status', auth(Role.PROVIDER), updateProviderOrderStatus);

export default router;
