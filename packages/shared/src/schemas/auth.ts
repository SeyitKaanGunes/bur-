import { z } from 'zod';
import { ZODIAC_SIGNS } from '../constants/zodiac';

export const emailSchema = z.string().email('Geçerli bir email adresi girin').max(255);

export const passwordSchema = z
  .string()
  .min(8, 'Şifre en az 8 karakter olmalı')
  .max(128, 'Şifre en fazla 128 karakter olabilir')
  .regex(/[A-Z]/, 'En az bir büyük harf gerekli')
  .regex(/[a-z]/, 'En az bir küçük harf gerekli')
  .regex(/[0-9]/, 'En az bir rakam gerekli');

export const nameSchema = z
  .string()
  .min(2, 'İsim en az 2 karakter olmalı')
  .max(100, 'İsim en fazla 100 karakter olabilir')
  .regex(/^[\p{L}\s]+$/u, 'İsim sadece harf içerebilir');

export const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Geçerli bir tarih girin (YYYY-MM-DD)')
  .refine((date) => {
    const parsed = new Date(date);
    const now = new Date();
    const minDate = new Date('1900-01-01');
    return parsed >= minDate && parsed <= now;
  }, 'Geçerli bir doğum tarihi girin');

export const birthTimeSchema = z
  .string()
  .regex(/^\d{2}:\d{2}$/, 'Geçerli bir saat girin (HH:MM)')
  .optional();

export const zodiacSignSchema = z.enum(ZODIAC_SIGNS);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
  birthDate: birthDateSchema,
  birthTime: birthTimeSchema,
  birthCity: z.string().max(200).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Şifre gerekli'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  birthDate: birthDateSchema.optional(),
  birthTime: birthTimeSchema,
  birthCity: z.string().max(200).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
