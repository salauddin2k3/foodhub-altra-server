import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['CUSTOMER', 'PROVIDER']),
  phone: z.string().optional(),
  address: z.string().optional(),
  providerProfile: z
    .object({
      restaurant: z.string().min(2),
      description: z.string().optional(),
      image: z.string().url().optional(),
      cuisine: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const mealSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  price: z.number().positive(),
  categoryId: z.string().min(1),
  image: z.string().url().optional(),
  cuisine: z.string().optional(),
  dietaryTags: z.array(z.string()).default([]),
  isAvailable: z.boolean().optional(),
});

export const createOrderSchema = z.object({
  providerProfileId: z.string().min(1),
  deliveryAddress: z.string().min(5),
  contactNumber: z.string().min(6),
  notes: z.string().optional(),
  items: z.array(z.object({
    mealId: z.string().min(1),
    quantity: z.number().int().positive(),
  })).min(1),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
});
