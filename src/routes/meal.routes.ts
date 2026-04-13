import { Router } from 'express';
import { Role } from '@prisma/client';
import { auth } from '../middlewares/auth';
import { addReview, createMeal, deleteMeal, getMealById, getMeals, updateMeal } from '../controllers/meal.controller';

const router = Router();

router.get('/', getMeals);
router.get('/:id', getMealById);
router.post('/', auth(Role.PROVIDER), createMeal);
router.put('/:id', auth(Role.PROVIDER), updateMeal);
router.delete('/:id', auth(Role.PROVIDER), deleteMeal);
router.post('/:id/reviews', auth(Role.CUSTOMER), addReview);

export default router;
