import { NextFunction, Request, Response } from 'express';
import { Role } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../utils/AppError';
import { verifyToken } from '../utils/jwt';

export const auth = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'Unauthorized access');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      status: decoded.status,
    };

    if (decoded.status !== 'ACTIVE') {
      throw new AppError(StatusCodes.FORBIDDEN, 'Your account is suspended');
    }

    if (roles.length && !roles.includes(decoded.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You are not allowed to access this route');
    }

    next();
  };
};
