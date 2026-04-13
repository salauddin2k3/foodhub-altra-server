import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { generateToken } from '../utils/jwt';
import { sendResponse } from '../utils/apiResponse';
import { loginSchema, registerSchema } from '../services/validators';

export const register = catchAsync(async (req, res) => {
  const payload = registerSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'Email already exists');
  }

  if (payload.role === Role.PROVIDER && !payload.providerProfile?.restaurant) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Provider profile is required for provider registration');
  }

  const hashedPassword = await bcrypt.hash(payload.password, env.bcryptSaltRounds);

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      role: payload.role,
      phone: payload.phone,
      address: payload.address,
      providerProfile:
        payload.role === Role.PROVIDER
          ? {
              create: {
                restaurant: payload.providerProfile!.restaurant,
                description: payload.providerProfile?.description,
                image: payload.providerProfile?.image,
                cuisine: payload.providerProfile?.cuisine,
              },
            }
          : undefined,
    },
    include: {
      providerProfile: true,
    },
  });

  const token = generateToken({ userId: user.id, role: user.role, status: user.status });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'User registered successfully',
    data: { token, user },
  });
});

export const login = catchAsync(async (req, res) => {
  const payload = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: { providerProfile: true },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const isPasswordMatched = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid credentials');
  }

  const token = generateToken({ userId: user.id, role: user.role, status: user.status });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Login successful',
    data: { token, user },
  });
});

export const getMe = catchAsync(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: {
      providerProfile: true,
    },
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User retrieved successfully',
    data: user,
  });
});
