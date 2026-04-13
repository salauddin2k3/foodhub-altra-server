import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/apiResponse';
import { mealSchema, reviewSchema } from '../services/validators';

export const getMeals = catchAsync(async (req, res) => {
  const { search, categoryId, cuisine, minPrice, maxPrice, dietaryTag } = req.query;

  const meals = await prisma.meal.findMany({
    where: {
      isAvailable: true,
      ...(search
        ? {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' } },
              { description: { contains: String(search), mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(categoryId ? { categoryId: String(categoryId) } : {}),
      ...(cuisine ? { cuisine: { contains: String(cuisine), mode: 'insensitive' } } : {}),
      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice ? { gte: Number(minPrice) } : {}),
              ...(maxPrice ? { lte: Number(maxPrice) } : {}),
            },
          }
        : {}),
      ...(dietaryTag ? { dietaryTags: { has: String(dietaryTag) } } : {}),
    },
    include: {
      category: true,
      providerProfile: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
      reviews: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meals retrieved successfully',
    data: meals,
  });
});

export const getMealById = catchAsync(async (req, res) => {
  const meal = await prisma.meal.findUnique({
    where: { id: req.params.id },
    include: {
      category: true,
      providerProfile: { include: { user: true } },
      reviews: { include: { user: { select: { id: true, name: true } } } },
    },
  });

  if (!meal) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Meal not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal retrieved successfully',
    data: meal,
  });
});

export const createMeal = catchAsync(async (req, res) => {
  const payload = mealSchema.parse(req.body);

  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const category = await prisma.category.findUnique({ where: { id: payload.categoryId } });
  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  const meal = await prisma.meal.create({
    data: {
      ...payload,
      providerProfileId: providerProfile.id,
    },
    include: { category: true, providerProfile: true },
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Meal created successfully',
    data: meal,
  });
});

export const updateMeal = catchAsync(async (req, res) => {
  const payload = mealSchema.partial().parse(req.body);

  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const existingMeal = await prisma.meal.findFirst({ where: { id: req.params.id, providerProfileId: providerProfile.id } });
  if (!existingMeal) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Meal not found or unauthorized');
  }

  const updatedMeal = await prisma.meal.update({
    where: { id: req.params.id },
    data: payload,
    include: { category: true, providerProfile: true },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal updated successfully',
    data: updatedMeal,
  });
});

export const deleteMeal = catchAsync(async (req, res) => {
  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const existingMeal = await prisma.meal.findFirst({ where: { id: req.params.id, providerProfileId: providerProfile.id } });
  if (!existingMeal) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Meal not found or unauthorized');
  }

  await prisma.meal.delete({ where: { id: req.params.id } });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Meal deleted successfully',
  });
});

export const addReview = catchAsync(async (req, res) => {
  const payload = reviewSchema.parse(req.body);
  const mealId = req.params.id;
  const userId = req.user!.userId;

  const meal = await prisma.meal.findUnique({ where: { id: mealId } });
  if (!meal) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Meal not found');
  }

  const deliveredOrder = await prisma.order.findFirst({
    where: {
      customerId: userId,
      status: 'DELIVERED',
      items: { some: { mealId } },
    },
  });

  if (!deliveredOrder) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can review only delivered meals you ordered');
  }

  const review = await prisma.review.upsert({
    where: { userId_mealId: { userId, mealId } },
    update: payload,
    create: { ...payload, userId, mealId },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review submitted successfully',
    data: review,
  });
});
