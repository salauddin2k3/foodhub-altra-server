import { Router } from 'express';
import authRoutes from './auth.routes';
import mealRoutes from './meal.routes';
import providerRoutes from './provider.routes';
import orderRoutes from './order.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'FoodHub API is running' });
});

router.use('/auth', authRoutes);
router.use('/meals', mealRoutes);
router.use('/providers', providerRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;
