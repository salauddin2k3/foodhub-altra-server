import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../middlewares/auth';
import { cancelOrder, createOrder, getMyOrders, getOrderById } from '../controllers/order.controller';

const router = Router();

router.post('/', auth(Role.CUSTOMER), createOrder);
router.get('/', auth(Role.CUSTOMER), getMyOrders);
router.get('/:id', auth(Role.CUSTOMER, Role.PROVIDER, Role.ADMIN), getOrderById);
router.patch('/:id/cancel', auth(Role.CUSTOMER), cancelOrder);

export default router;
