import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const amountSchema = z.number().min(0).multipleOf(0.01);

export const categoryNameSchema = z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or fewer');

export const limitSchema = z.object({
  amount: amountSchema,
  effectiveFromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
});

export const columnMappingSchema = z.object({
  dateColumnIndex:       z.number().int().min(0),
  categoryColumnIndexes: z.array(z.number().int().min(0)).min(1, 'Select at least one category column'),
  incomeColumnIndex:     z.number().int().min(0),
  scaleFactor:           z.number().positive('Scale factor must be a positive number'),
  invertSign:            z.boolean(),
}).refine(
  d => !d.categoryColumnIndexes.includes(d.dateColumnIndex),
  { message: 'Date column cannot also be a category column', path: ['categoryColumnIndexes'] },
).refine(
  d => d.incomeColumnIndex !== d.dateColumnIndex,
  { message: 'Income column cannot be the same as the date column', path: ['incomeColumnIndex'] },
).refine(
  d => !d.categoryColumnIndexes.includes(d.incomeColumnIndex),
  { message: 'Income column cannot also be a category column', path: ['incomeColumnIndex'] },
);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
