import { cookies } from 'next/headers';
import { hashPassword, verifyPassword, generateToken } from '@burcum/shared';

const SESSION_COOKIE_NAME = 'burcum_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 gün

// Type for user without password
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity?: string | null;
  zodiacSign: string;
  emailVerifiedAt?: Date | null;
  subscriptionTier: 'free' | 'premium' | 'vip';
  dailyReadingsCount: number;
  lastReadingDate?: string | null;
  createdAt: Date;
};

// ===== Cloudflare D1 HTTP API Client =====
// Vercel'den Cloudflare D1'e REST API üzerinden erişim

function hasD1Http(): boolean {
  return !!(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_D1_DATABASE_ID &&
    process.env.CLOUDFLARE_API_TOKEN
  );
}

interface D1HttpResult {
  results: any[];
  success: boolean;
  meta?: { changes?: number; last_row_id?: number };
}

async function d1Query(sql: string, params: any[] = []): Promise<D1HttpResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
  const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID!;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN!;

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('D1 HTTP API error:', response.status, text);
    throw new Error(`D1 API error: ${response.status}`);
  }

  const data = await response.json() as any;

  if (!data.success) {
    console.error('D1 query error:', data.errors);
    throw new Error(`D1 query failed: ${JSON.stringify(data.errors)}`);
  }

  // D1 HTTP API returns array of results (one per statement)
  const result = data.result?.[0] || { results: [], success: true };
  return result;
}

// Get database from Cloudflare binding (Cloudflare Workers only)
async function getDbAndSchema(d1: D1Database) {
  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('@burcum/shared/db');
  return { db: drizzle(d1, { schema }), schema, eq };
}

// In-memory fallback for development (when no DB is available)
const inMemorySessions = new Map<string, { userId: string; expiresAt: Date }>();
const inMemoryUsers = new Map<string, {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  zodiacSign: string;
  emailVerifiedAt?: Date;
  subscriptionTier: 'free' | 'premium' | 'vip';
  dailyReadingsCount: number;
  lastReadingDate?: string;
  createdAt: Date;
}>();
const inMemoryVerificationTokens = new Map<string, { userId: string; expiresAt: Date }>();

// Check if we have D1 database via Cloudflare Workers binding
function hasD1Binding(): boolean {
  return typeof (globalThis as any).__env?.DB !== 'undefined' &&
         (globalThis as any).__env?.DB !== undefined;
}

function getD1(): D1Database | null {
  if (hasD1Binding()) {
    return (globalThis as any).__env?.DB || null;
  }
  return null;
}

// Determine which storage backend to use
type StorageBackend = 'd1-binding' | 'd1-http' | 'in-memory';

function getStorageBackend(): StorageBackend {
  if (hasD1Binding()) return 'd1-binding';
  if (hasD1Http()) return 'd1-http';
  return 'in-memory';
}

// ===== Auth Error types =====
export class AuthError extends Error {
  code: 'USER_NOT_FOUND' | 'WRONG_PASSWORD' | 'EMAIL_EXISTS' | 'GENERAL';
  constructor(message: string, code: AuthError['code'] = 'GENERAL') {
    super(message);
    this.code = code;
  }
}

// ===== CREATE USER =====
export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  zodiacSign: string;
}) {
  const backend = getStorageBackend();
  const passwordHash = await hashPassword(data.password);
  const id = generateToken(16);
  const verificationToken = generateToken(32);
  const now = new Date();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);

    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email.toLowerCase()))
      .get();

    if (existing) {
      throw new AuthError('Bu email adresi zaten kayitli', 'EMAIL_EXISTS');
    }

    const [user] = await db
      .insert(schema.users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash,
        name: data.name,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthCity: data.birthCity,
        zodiacSign: data.zodiacSign as any,
        subscriptionTier: 'free',
        dailyReadingsCount: 0,
      })
      .returning();

    await db.insert(schema.emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return { user, verificationToken };
  }

  if (backend === 'd1-http') {
    // Check if email already exists
    const existing = await d1Query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [data.email.toLowerCase()]
    );
    if (existing.results.length > 0) {
      throw new AuthError('Bu email adresi zaten kayitli', 'EMAIL_EXISTS');
    }

    // Insert user
    await d1Query(
      `INSERT INTO users (id, email, password_hash, name, birth_date, birth_time, birth_city, zodiac_sign, subscription_tier, daily_readings_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'free', 0, ?, ?)`,
      [
        id,
        data.email.toLowerCase(),
        passwordHash,
        data.name,
        data.birthDate,
        data.birthTime || null,
        data.birthCity || null,
        data.zodiacSign,
        Math.floor(now.getTime() / 1000),
        Math.floor(now.getTime() / 1000),
      ]
    );

    // Insert verification token
    const vtId = generateToken(16);
    await d1Query(
      `INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [
        vtId,
        id,
        verificationToken,
        Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
        Math.floor(now.getTime() / 1000),
      ]
    );

    const user = {
      id,
      email: data.email.toLowerCase(),
      passwordHash,
      name: data.name,
      birthDate: data.birthDate,
      birthTime: data.birthTime,
      birthCity: data.birthCity,
      zodiacSign: data.zodiacSign,
      subscriptionTier: 'free' as const,
      dailyReadingsCount: 0,
      createdAt: now,
    };

    console.log('[D1-HTTP] User created:', data.email.toLowerCase());
    return { user, verificationToken };
  }

  // In-memory fallback
  if (inMemoryUsers.has(data.email.toLowerCase())) {
    throw new AuthError('Bu email adresi zaten kayitli', 'EMAIL_EXISTS');
  }

  const user = {
    id,
    email: data.email.toLowerCase(),
    passwordHash,
    name: data.name,
    birthDate: data.birthDate,
    birthTime: data.birthTime,
    birthCity: data.birthCity,
    zodiacSign: data.zodiacSign,
    subscriptionTier: 'free' as const,
    dailyReadingsCount: 0,
    createdAt: now,
  };

  inMemoryUsers.set(user.email, user);

  inMemoryVerificationTokens.set(verificationToken, {
    userId: id,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  console.log('[IN-MEMORY] User created:', user.email, '(WARNING: data will be lost on restart)');
  return { user, verificationToken };
}

// ===== AUTHENTICATE USER =====
export async function authenticateUser(email: string, password: string) {
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .get();

    if (!user) {
      throw new AuthError('Bu email ile kayitli hesap bulunamadi', 'USER_NOT_FOUND');
    }

    const isValid = await verifyPassword(password, user.passwordHash || '');
    if (!isValid) {
      throw new AuthError('Email veya sifre hatali', 'WRONG_PASSWORD');
    }

    return user;
  }

  if (backend === 'd1-http') {
    const result = await d1Query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );

    if (result.results.length === 0) {
      throw new AuthError('Bu email ile kayitli hesap bulunamadi', 'USER_NOT_FOUND');
    }

    const row = result.results[0];
    const isValid = await verifyPassword(password, row.password_hash || '');
    if (!isValid) {
      throw new AuthError('Email veya sifre hatali', 'WRONG_PASSWORD');
    }

    // Map D1 row to user object
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      name: row.name,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthCity: row.birth_city,
      zodiacSign: row.zodiac_sign,
      emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at * 1000) : null,
      subscriptionTier: row.subscription_tier || 'free',
      dailyReadingsCount: row.daily_readings_count || 0,
      lastReadingDate: row.last_reading_date,
      createdAt: new Date((row.created_at || 0) * 1000),
    };
  }

  // In-memory
  const user = inMemoryUsers.get(email.toLowerCase());
  if (!user) {
    throw new AuthError('Bu email ile kayitli hesap bulunamadi', 'USER_NOT_FOUND');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AuthError('Email veya sifre hatali', 'WRONG_PASSWORD');
  }

  return user;
}

// ===== CREATE SESSION =====
export async function createSession(userId: string) {
  const sessionId = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema } = await getDbAndSchema(d1);
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      expiresAt,
    });
  } else if (backend === 'd1-http') {
    await d1Query(
      `INSERT INTO sessions (id, user_id, expires_at, created_at)
       VALUES (?, ?, ?, ?)`,
      [
        sessionId,
        userId,
        Math.floor(expiresAt.getTime() / 1000),
        Math.floor(Date.now() / 1000),
      ]
    );
  } else {
    inMemorySessions.set(sessionId, { userId, expiresAt });
  }

  // Cookie ayarla
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || !!process.env.VERCEL,
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return sessionId;
}

// ===== GET SESSION =====
export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  // Session ID format validation (guvenlik icin)
  if (!/^[A-Za-z0-9]{32}$/.test(sessionId)) {
    return null;
  }

  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    const session = await db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.id, sessionId))
      .get();

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
      }
      return null;
    }

    return session;
  }

  if (backend === 'd1-http') {
    const result = await d1Query(
      'SELECT * FROM sessions WHERE id = ? LIMIT 1',
      [sessionId]
    );

    if (result.results.length === 0) return null;

    const row = result.results[0];
    const expiresAt = new Date((row.expires_at || 0) * 1000);

    if (expiresAt < new Date()) {
      // Delete expired session
      await d1Query('DELETE FROM sessions WHERE id = ?', [sessionId]);
      return null;
    }

    return { userId: row.user_id, expiresAt };
  }

  // In-memory
  const session = inMemorySessions.get(sessionId);
  if (!session || session.expiresAt < new Date()) {
    if (session) inMemorySessions.delete(sessionId);
    return null;
  }
  return session;
}

// ===== GET CURRENT USER =====
export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;

  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .get();

    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser as SafeUser;
  }

  if (backend === 'd1-http') {
    const result = await d1Query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [session.userId]
    );

    if (result.results.length === 0) return null;

    const row = result.results[0];
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      birthDate: row.birth_date,
      birthTime: row.birth_time,
      birthCity: row.birth_city,
      zodiacSign: row.zodiac_sign,
      emailVerifiedAt: row.email_verified_at ? new Date(row.email_verified_at * 1000) : null,
      subscriptionTier: row.subscription_tier || 'free',
      dailyReadingsCount: row.daily_readings_count || 0,
      lastReadingDate: row.last_reading_date,
      createdAt: new Date((row.created_at || 0) * 1000),
    };
  }

  // In-memory
  for (const user of inMemoryUsers.values()) {
    if (user.id === session.userId) {
      const { passwordHash, ...safeUser } = user;
      return safeUser as unknown as SafeUser;
    }
  }
  return null;
}

// ===== DELETE SESSION =====
export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    const backend = getStorageBackend();

    if (backend === 'd1-binding') {
      const d1 = getD1()!;
      const { db, schema, eq } = await getDbAndSchema(d1);
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
    } else if (backend === 'd1-http') {
      await d1Query('DELETE FROM sessions WHERE id = ?', [sessionId]);
    } else {
      inMemorySessions.delete(sessionId);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

// ===== VERIFY EMAIL =====
export async function verifyEmail(token: string) {
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    const tokenData = await db
      .select()
      .from(schema.emailVerificationTokens)
      .where(eq(schema.emailVerificationTokens.token, token))
      .get();

    if (!tokenData) {
      throw new Error('Gecersiz veya suresi dolmus dogrulama linki');
    }

    if (tokenData.expiresAt < new Date()) {
      await db.delete(schema.emailVerificationTokens)
        .where(eq(schema.emailVerificationTokens.id, tokenData.id));
      throw new Error('Dogrulama linkinin suresi dolmus');
    }

    await db
      .update(schema.users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(schema.users.id, tokenData.userId));

    await db.delete(schema.emailVerificationTokens)
      .where(eq(schema.emailVerificationTokens.id, tokenData.id));

    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, tokenData.userId))
      .get();

    return user;
  }

  if (backend === 'd1-http') {
    const tokenResult = await d1Query(
      'SELECT * FROM email_verification_tokens WHERE token = ? LIMIT 1',
      [token]
    );

    if (tokenResult.results.length === 0) {
      throw new Error('Gecersiz veya suresi dolmus dogrulama linki');
    }

    const tokenRow = tokenResult.results[0];
    const expiresAt = new Date((tokenRow.expires_at || 0) * 1000);

    if (expiresAt < new Date()) {
      await d1Query('DELETE FROM email_verification_tokens WHERE id = ?', [tokenRow.id]);
      throw new Error('Dogrulama linkinin suresi dolmus');
    }

    const now = Math.floor(Date.now() / 1000);
    await d1Query(
      'UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?',
      [now, now, tokenRow.user_id]
    );

    await d1Query('DELETE FROM email_verification_tokens WHERE id = ?', [tokenRow.id]);

    const userResult = await d1Query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [tokenRow.user_id]
    );

    return userResult.results[0] || null;
  }

  // In-memory
  const tokenData = inMemoryVerificationTokens.get(token);
  if (!tokenData) {
    throw new Error('Gecersiz veya suresi dolmus dogrulama linki');
  }

  if (tokenData.expiresAt < new Date()) {
    inMemoryVerificationTokens.delete(token);
    throw new Error('Dogrulama linkinin suresi dolmus');
  }

  for (const [email, user] of inMemoryUsers.entries()) {
    if (user.id === tokenData.userId) {
      user.emailVerifiedAt = new Date();
      inMemoryUsers.set(email, user);
      inMemoryVerificationTokens.delete(token);
      return user;
    }
  }

  throw new Error('Kullanici bulunamadi');
}

// ===== UPDATE USER PASSWORD =====
export async function updateUserPassword(userId: string, newPasswordHash: string) {
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    await db
      .update(schema.users)
      .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));
  } else if (backend === 'd1-http') {
    const now = Math.floor(Date.now() / 1000);
    await d1Query(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?',
      [newPasswordHash, now, userId]
    );
  } else {
    for (const [email, user] of inMemoryUsers.entries()) {
      if (user.id === userId) {
        user.passwordHash = newPasswordHash;
        inMemoryUsers.set(email, user);
        break;
      }
    }
  }
}

// ===== GET USER BY EMAIL =====
export async function getUserByEmail(email: string) {
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    return db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .get();
  }

  if (backend === 'd1-http') {
    const result = await d1Query(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase()]
    );
    return result.results[0] || null;
  }

  return inMemoryUsers.get(email.toLowerCase()) || null;
}

// ===== UPDATE USER READING COUNT =====
export async function updateUserReadingCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const backend = getStorageBackend();

  if (backend === 'd1-binding') {
    const d1 = getD1()!;
    const { db, schema, eq } = await getDbAndSchema(d1);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .get();

    if (!user) return null;

    const newCount = user.lastReadingDate !== today ? 1 : user.dailyReadingsCount + 1;

    await db
      .update(schema.users)
      .set({
        dailyReadingsCount: newCount,
        lastReadingDate: today,
      })
      .where(eq(schema.users.id, userId));

    return { ...user, dailyReadingsCount: newCount, lastReadingDate: today };
  }

  if (backend === 'd1-http') {
    const result = await d1Query(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (result.results.length === 0) return null;

    const row = result.results[0];
    const newCount = row.last_reading_date !== today ? 1 : (row.daily_readings_count || 0) + 1;
    const now = Math.floor(Date.now() / 1000);

    await d1Query(
      'UPDATE users SET daily_readings_count = ?, last_reading_date = ?, updated_at = ? WHERE id = ?',
      [newCount, today, now, userId]
    );

    return {
      ...row,
      dailyReadingsCount: newCount,
      lastReadingDate: today,
    };
  }

  // In-memory
  for (const [email, user] of inMemoryUsers.entries()) {
    if (user.id === userId) {
      if (user.lastReadingDate !== today) {
        user.dailyReadingsCount = 1;
        user.lastReadingDate = today;
      } else {
        user.dailyReadingsCount++;
      }
      inMemoryUsers.set(email, user);
      return user;
    }
  }
  return null;
}
