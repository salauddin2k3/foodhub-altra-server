import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/apiResponse';
import { categorySchema, updateUserStatusSchema } from '../services/validators';
import { slugify } from '../utils/slugify';

export const getAdminDashboard = catchAsync(async (req, res) => {
  const [totalUsers, totalProviders, totalCustomers, totalOrders, totalMeals] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'PROVIDER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.count(),
    prisma.meal.count(),
  ]);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Admin dashboard retrieved successfully',
    data: { totalUsers, totalProviders, totalCustomers, totalOrders, totalMeals },
  });
});

export const getUsers = catchAsync(async (req, res) => {
  const users = await prisma.user.findMany({
    include: { providerProfile: true },
    orderBy: { createdAt: 'desc' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: users,
  });
});

export const updateUserStatus = catchAsync(async (req, res) => {
  const payload = updateUserStatusSchema.parse(req.body);
  const userId = req.params.id;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: payload.status },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User status updated successfully',
    data: updatedUser,
  });
});

export const getAllOrders = catchAsync(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      providerProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      items: { include: { meal: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'All orders retrieved successfully',
    data: orders,
  });
});

export const getCategories = catchAsync(async (req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: categories,
  });
});

export const createCategory = catchAsync(async (req, res) => {
  const payload = categorySchema.parse(req.body);
  const slug = slugify(payload.name);

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name: payload.name }, { slug }],
    },
  });

  if (existingCategory) {
    throw new AppError(StatusCodes.CONFLICT, 'Category already exists');
  }

  const category = await prisma.category.create({
    data: { name: payload.name, slug },
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Category created successfully',
    data: category,
  });
});

export const updateCategory = catchAsync(async (req, res) => {
  const payload = categorySchema.parse(req.body);
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  const updatedCategory = await prisma.category.update({
    where: { id: req.params.id },
    data: {
      name: payload.name,
      slug: slugify(payload.name),
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory,
  });
});

export const deleteCategory = catchAsync(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  await prisma.category.delete({ where: { id: req.params.id } });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category deleted successfully',
  });
});
