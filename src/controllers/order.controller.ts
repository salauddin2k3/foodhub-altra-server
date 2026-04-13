import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { sendResponse } from '../utils/apiResponse';
import { createOrderSchema } from '../services/validators';

export const createOrder = catchAsync(async (req, res) => {
  const payload = createOrderSchema.parse(req.body);

  const provider = await prisma.providerProfile.findUnique({ where: { id: payload.providerProfileId } });
  if (!provider) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Provider not found');
  }

  const mealIds = payload.items.map((item) => item.mealId);
  const meals = await prisma.meal.findMany({ where: { id: { in: mealIds }, providerProfileId: payload.providerProfileId, isAvailable: true } });

  if (meals.length !== payload.items.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Some meals are invalid, unavailable, or belong to another provider');
  }

  const totalAmount = payload.items.reduce((total, item) => {
    const meal = meals.find((m) => m.id === item.mealId)!;
    return total + meal.price * item.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      customerId: req.user!.userId,
      providerProfileId: payload.providerProfileId,
      deliveryAddress: payload.deliveryAddress,
      contactNumber: payload.contactNumber,
      notes: payload.notes,
      totalAmount,
      items: {
        create: payload.items.map((item) => {
          const meal = meals.find((m) => m.id === item.mealId)!;
          return {
            mealId: item.mealId,
            quantity: item.quantity,
            unitPrice: meal.price,
          };
        }),
      },
    },
    include: {
      items: { include: { meal: true } },
      customer: { select: { id: true, name: true, email: true } },
      providerProfile: true,
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Order created successfully',
    data: order,
  });
});

export const getMyOrders = catchAsync(async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { customerId: req.user!.userId },
    include: {
      providerProfile: true,
      items: { include: { meal: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Orders retrieved successfully',
    data: orders,
  });
});

export const getOrderById = catchAsync(async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      providerProfile: { include: { user: { select: { id: true, name: true, email: true } } } },
      items: { include: { meal: true } },
    },
  });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  const isOwner = order.customerId === req.user!.userId;
  const isProviderOwner = order.providerProfile.userId === req.user!.userId;
  const isAdmin = req.user!.role === 'ADMIN';

  if (!isOwner && !isProviderOwner && !isAdmin) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to view this order');
  }

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order retrieved successfully',
    data: order,
  });
});

export const cancelOrder = catchAsync(async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: req.params.id, customerId: req.user!.userId },
  });

  if (!order) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Order not found');
  }

  if (order.status !== 'PLACED') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Only placed orders can be cancelled');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED' },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Order cancelled successfully',
    data: updatedOrder,
  });
});
