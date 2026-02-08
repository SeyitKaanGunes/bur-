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

// Get database from Cloudflare binding (dynamic import to avoid errors on Vercel)
async function getDbAndSchema(d1: D1Database) {
  const { drizzle } = await import('drizzle-orm/d1');
  const { eq } = await import('drizzle-orm');
  const schema = await import('@burcum/shared/db');
  return { db: drizzle(d1, { schema }), schema, eq };
}

// In-memory fallback for development (when D1 is not available)
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

// Check if we have D1 database available
function hasD1(): boolean {
  return typeof process !== 'undefined' &&
         process.env.NODE_ENV === 'production' &&
         typeof (globalThis as any).__env?.DB !== 'undefined';
}

function getD1(): D1Database | null {
  if (hasD1()) {
    return (globalThis as any).__env?.DB || null;
  }
  return null;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity?: string;
  zodiacSign: string;
}) {
  const d1 = getD1();

  if (d1) {
    // Production: Use D1
    const { db, schema, eq } = await getDbAndSchema(d1);

    // Email kontrolü
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, data.email.toLowerCase()))
      .get();

    if (existing) {
      throw new Error('Bu email adresi zaten kayıtlı');
    }

    const passwordHash = await hashPassword(data.password);

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

    // Verification token oluştur
    const verificationToken = generateToken(32);
    await db.insert(schema.emailVerificationTokens).values({
      userId: user.id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return { user, verificationToken };
  } else {
    // Development/Vercel: Use in-memory
    if (inMemoryUsers.has(data.email.toLowerCase())) {
      throw new Error('Bu email adresi zaten kayıtlı');
    }

    const id = generateToken(16);
    const passwordHash = await hashPassword(data.password);

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
      createdAt: new Date(),
    };

    inMemoryUsers.set(user.email, user);

    const verificationToken = generateToken(32);
    inMemoryVerificationTokens.set(verificationToken, {
      userId: id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    return { user, verificationToken };
  }
}

export async function authenticateUser(email: string, password: string) {
  const d1 = getD1();

  if (d1) {
    const { db, schema, eq } = await getDbAndSchema(d1);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .get();

    if (!user) {
      throw new Error('Email veya şifre hatalı');
    }

    const isValid = await verifyPassword(password, user.passwordHash || '');
    if (!isValid) {
      throw new Error('Email veya şifre hatalı');
    }

    return user;
  } else {
    const user = inMemoryUsers.get(email.toLowerCase());
    if (!user) {
      throw new Error('Email veya şifre hatalı');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Email veya şifre hatalı');
    }

    return user;
  }
}

export async function createSession(userId: string) {
  const sessionId = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const d1 = getD1();

  if (d1) {
    const { db, schema } = await getDbAndSchema(d1);
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      expiresAt,
    });
  } else {
    inMemorySessions.set(sessionId, { userId, expiresAt });
  }

  // Cookie ayarla
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });

  return sessionId;
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  // Session ID format validation (güvenlik için)
  if (!/^[A-Za-z0-9]{32}$/.test(sessionId)) {
    return null;
  }

  const d1 = getD1();

  if (d1) {
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
  } else {
    const session = inMemorySessions.get(sessionId);
    if (!session || session.expiresAt < new Date()) {
      if (session) inMemorySessions.delete(sessionId);
      return null;
    }
    return session;
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session) return null;

  const d1 = getD1();

  if (d1) {
    const { db, schema, eq } = await getDbAndSchema(d1);
    const user = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, session.userId))
      .get();

    if (!user) return null;

    const { passwordHash, ...safeUser } = user;
    return safeUser as SafeUser;
  } else {
    for (const user of inMemoryUsers.values()) {
      if (user.id === session.userId) {
        const { passwordHash, ...safeUser } = user;
        return safeUser as unknown as SafeUser;
      }
    }
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionId) {
    const d1 = getD1();
    if (d1) {
      const { db, schema, eq } = await getDbAndSchema(d1);
      await db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId));
    } else {
      inMemorySessions.delete(sessionId);
    }
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function verifyEmail(token: string) {
  const d1 = getD1();

  if (d1) {
    const { db, schema, eq } = await getDbAndSchema(d1);
    const tokenData = await db
      .select()
      .from(schema.emailVerificationTokens)
      .where(eq(schema.emailVerificationTokens.token, token))
      .get();

    if (!tokenData) {
      throw new Error('Geçersiz veya süresi dolmuş doğrulama linki');
    }

    if (tokenData.expiresAt < new Date()) {
      await db.delete(schema.emailVerificationTokens)
        .where(eq(schema.emailVerificationTokens.id, tokenData.id));
      throw new Error('Doğrulama linkinin süresi dolmuş');
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
  } else {
    const tokenData = inMemoryVerificationTokens.get(token);
    if (!tokenData) {
      throw new Error('Geçersiz veya süresi dolmuş doğrulama linki');
    }

    if (tokenData.expiresAt < new Date()) {
      inMemoryVerificationTokens.delete(token);
      throw new Error('Doğrulama linkinin süresi dolmuş');
    }

    for (const [email, user] of inMemoryUsers.entries()) {
      if (user.id === tokenData.userId) {
        user.emailVerifiedAt = new Date();
        inMemoryUsers.set(email, user);
        inMemoryVerificationTokens.delete(token);
        return user;
      }
    }

    throw new Error('Kullanıcı bulunamadı');
  }
}

export async function getUserByEmail(email: string) {
  const d1 = getD1();

  if (d1) {
    const { db, schema, eq } = await getDbAndSchema(d1);
    return db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email.toLowerCase()))
      .get();
  } else {
    return inMemoryUsers.get(email.toLowerCase()) || null;
  }
}

export async function updateUserReadingCount(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const d1 = getD1();

  if (d1) {
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
  } else {
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
}
