import { z } from 'zod';
import { ZODIAC_SIGNS } from '../constants/zodiac';

export const zodiacSignParamSchema = z.enum(ZODIAC_SIGNS);

export const readingTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'yearly']);

export const compatibilitySchema = z.object({
  sign1: zodiacSignParamSchema,
  sign2: zodiacSignParamSchema,
});

export const birthChartSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const personalQuestionSchema = z.object({
  question: z
    .string()
    .min(10, 'Soru en az 10 karakter olmalı')
    .max(500, 'Soru en fazla 500 karakter olabilir'),
});

export type CompatibilityInput = z.infer<typeof compatibilitySchema>;
export type BirthChartInput = z.infer<typeof birthChartSchema>;
export type PersonalQuestionInput = z.infer<typeof personalQuestionSchema>;
