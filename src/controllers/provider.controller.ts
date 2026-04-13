import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/apiResponse';
import { updateOrderStatusSchema } from '../services/validators';

export const getProviders = catchAsync(async (req, res) => {
  const providers = await prisma.providerProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      meals: true,
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Providers retrieved successfully',
    data: providers,
  });
});

export const getProviderById = catchAsync(async (req, res) => {
  const provider = await prisma.providerProfile.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      meals: { include: { category: true, reviews: true } },
    },
  });

  if (!provider) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider retrieved successfully',
    data: provider,
  });
});

export const getProviderDashboard = catchAsync(async (req, res) => {
  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const [totalMeals, totalOrders, recentOrders] = await Promise.all([
    prisma.meal.count({ where: { providerProfileId: providerProfile.id } }),
    prisma.order.count({ where: { providerProfileId: providerProfile.id } }),
    prisma.order.findMany({
      where: { providerProfileId: providerProfile.id },
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { meal: true } },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider dashboard retrieved successfully',
    data: { totalMeals, totalOrders, recentOrders },
  });
});

export const getProviderOrders = catchAsync(async (req, res) => {
  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const orders = await prisma.order.findMany({
    where: { providerProfileId: providerProfile.id },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { meal: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Provider orders retrieved successfully',
    data: orders,
  });
});

export const updateProviderOrderStatus = catchAsync(async (req, res) => {
  const payload = updateOrderStatusSchema.parse(req.body);

  const providerProfile = await prisma.providerProfile.findUnique({ where: { userId: req.user!.userId } });
  if (!providerProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider profile not found');
  }

  const order = await prisma.order.findFirst({ where: { id: req.params.id, providerProfileId: providerProfile.id } });
  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found or unauthorized');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: payload.status },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
});
