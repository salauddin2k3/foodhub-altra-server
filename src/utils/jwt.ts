import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const generateToken = (payload: { userId: string; role: string; status: string }) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn,
  });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, env.jwtAccessSecret) as {
    userId: string;
    role: any;
    status: any;
    iat: number;
    exp: number;
  };
};
