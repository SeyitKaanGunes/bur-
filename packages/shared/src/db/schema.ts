import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { createId } from '@paralleldrive/cuid2';
import { ZODIAC_SIGNS, type ZodiacSign } from '../constants/zodiac';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '../constants/subscription';

// Users tablosu
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    email: text('email').unique(),
    emailVerifiedAt: integer('email_verified_at', { mode: 'timestamp' }),
    passwordHash: text('password_hash'),
    name: text('name').notNull(),
    birthDate: text('birth_date').notNull(),
    birthTime: text('birth_time'),
    birthCity: text('birth_city'),
    birthLatitude: real('birth_latitude'),
    birthLongitude: real('birth_longitude'),
    zodiacSign: text('zodiac_sign', { enum: ZODIAC_SIGNS }).notNull(),
    ascendantSign: text('ascendant_sign', { enum: ZODIAC_SIGNS }),
    moonSign: text('moon_sign', { enum: ZODIAC_SIGNS }),
    subscriptionTier: text('subscription_tier', { enum: SUBSCRIPTION_TIERS })
      .default('free')
      .notNull(),
    subscriptionExpiresAt: integer('subscription_expires_at', { mode: 'timestamp' }),
    dailyReadingsCount: integer('daily_readings_count').default(0).notNull(),
    lastReadingDate: text('last_reading_date'),
    pushToken: text('push_token'),
    preferences: text('preferences', { mode: 'json' }).$type<{
      dailyNotification: boolean;
      weeklyNotification: boolean;
      specialEvents: boolean;
      notificationTime: string;
      theme: 'light' | 'dark' | 'system';
    }>(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('idx_users_email').on(table.email),
    zodiacIdx: index('idx_users_zodiac').on(table.zodiacSign),
  })
);

// Sessions tablosu
export const sessions = sqliteTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deviceInfo: text('device_info'),
    ipAddress: text('ip_address'),
    expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index('idx_sessions_user').on(table.userId),
    expiresIdx: index('idx_sessions_expires').on(table.expiresAt),
  })
);

// Email verification tokens
export const emailVerificationTokens = sqliteTable('email_verification_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Password reset tokens
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Horoscope readings (cache)
export const horoscopeReadings = sqliteTable(
  'horoscope_readings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    zodiacSign: text('zodiac_sign', { enum: ZODIAC_SIGNS }).notNull(),
    readingType: text('reading_type', {
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    }).notNull(),
    readingDate: text('reading_date').notNull(),
    content: text('content').notNull(),
    loveScore: integer('love_score'),
    careerScore: integer('career_score'),
    healthScore: integer('health_score'),
    luckyNumbers: text('lucky_numbers', { mode: 'json' }).$type<number[]>(),
    luckyColor: text('lucky_color'),
    advice: text('advice'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    lookupIdx: uniqueIndex('idx_readings_lookup').on(
      table.zodiacSign,
      table.readingType,
      table.readingDate
    ),
  })
);

// Personal readings
export const personalReadings = sqliteTable(
  'personal_readings',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    readingType: text('reading_type', {
      enum: ['birth_chart', 'compatibility', 'transit', 'personal_question'],
    }).notNull(),
    question: text('question'),
    content: text('content').notNull(),
    metadata: text('metadata', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    userIdx: index('idx_personal_user').on(table.userId, table.readingType),
  })
);

// Compatibility checks
export const compatibilityChecks = sqliteTable(
  'compatibility_checks',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
    sign1: text('sign1', { enum: ZODIAC_SIGNS }).notNull(),
    sign2: text('sign2', { enum: ZODIAC_SIGNS }).notNull(),
    overallScore: integer('overall_score'),
    loveScore: integer('love_score'),
    friendshipScore: integer('friendship_score'),
    workScore: integer('work_score'),
    analysis: text('analysis'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => ({
    signsIdx: index('idx_compatibility_signs').on(table.sign1, table.sign2),
  })
);

// Rate limits
export const rateLimits = sqliteTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').default(1).notNull(),
  windowStart: integer('window_start', { mode: 'timestamp' })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Subscriptions
export const subscriptions = sqliteTable(
  'subscriptions',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tier: text('tier', { enum: ['premium', 'vip'] }).notNull(),
    platform: text('platform', { enum: ['web', 'ios', 'android'] }).notNull(),
    externalId: text('external_id'),
    status: text('status', { enum: ['active', 'cancelled', 'expired'] })
      .default('active')
      .notNull(),
    startedAt: integer('started_at', { mode: 'timestamp' })
      .$defaultFn(() => new Date())
      .notNull(),
    expiresAt: integer('expires_at', { mode: 'timestamp' }),
    cancelledAt: integer('cancelled_at', { mode: 'timestamp' }),
  },
  (table) => ({
    userIdx: index('idx_subscriptions_user').on(table.userId),
    externalIdx: index('idx_subscriptions_external').on(table.externalId),
  })
);

// Type exports
export type UserInsert = typeof users.$inferInsert;
export type UserSelect = typeof users.$inferSelect;
export type SessionInsert = typeof sessions.$inferInsert;
export type SessionSelect = typeof sessions.$inferSelect;
export type HoroscopeReadingInsert = typeof horoscopeReadings.$inferInsert;
export type HoroscopeReadingSelect = typeof horoscopeReadings.$inferSelect;
export type PersonalReadingInsert = typeof personalReadings.$inferInsert;
export type PersonalReadingSelect = typeof personalReadings.$inferSelect;
export type CompatibilityCheckInsert = typeof compatibilityChecks.$inferInsert;
export type CompatibilityCheckSelect = typeof compatibilityChecks.$inferSelect;
export type SubscriptionInsert = typeof subscriptions.$inferInsert;
export type SubscriptionSelect = typeof subscriptions.$inferSelect;
