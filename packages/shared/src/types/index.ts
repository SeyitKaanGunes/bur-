import type { ZodiacSign } from '../constants/zodiac';
import type { SubscriptionTier } from '../constants/subscription';

export type { ZodiacSign, SubscriptionTier };

export type ReadingType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface User {
  id: string;
  email: string | null;
  emailVerifiedAt: Date | null;
  name: string;
  birthDate: string;
  birthTime: string | null;
  birthCity: string | null;
  birthLatitude: number | null;
  birthLongitude: number | null;
  zodiacSign: ZodiacSign;
  ascendantSign: ZodiacSign | null;
  moonSign: ZodiacSign | null;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt: Date | null;
  dailyReadingsCount: number;
  lastReadingDate: string | null;
  pushToken: string | null;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  dailyNotification: boolean;
  weeklyNotification: boolean;
  specialEvents: boolean;
  notificationTime: string;
  theme: 'light' | 'dark' | 'system';
}

export interface HoroscopeReading {
  id: string;
  zodiacSign: ZodiacSign;
  readingType: ReadingType;
  readingDate: string;
  content: string;
  loveScore: number;
  careerScore: number;
  healthScore: number;
  luckyNumbers: number[];
  luckyColor: string;
  advice?: string;
  createdAt: Date;
}

export interface PersonalReading {
  id: string;
  userId: string;
  readingType: 'birth_chart' | 'compatibility' | 'transit' | 'personal_question';
  question?: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface CompatibilityResult {
  id: string;
  sign1: ZodiacSign;
  sign2: ZodiacSign;
  overallScore: number;
  loveScore: number;
  friendshipScore: number;
  workScore: number;
  analysis: string;
  strengths: string[];
  challenges: string[];
  advice: string;
}

export interface BirthChart {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign | null;
  ascendant: ZodiacSign | null;
  planets: PlanetPosition[];
  houses: HousePosition[];
  aspects: Aspect[];
}

export interface PlanetPosition {
  planet: string;
  sign: ZodiacSign;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  house: number;
  sign: ZodiacSign;
  degree: number;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';
  orb: number;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
