import { NextRequest, NextResponse } from 'next/server';
import { loginSchema, SECURITY_HEADERS } from '@burcum/shared';
import { authenticateUser, createSession, AuthError } from '@/lib/auth';

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; blockedUntil?: Date }>();

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const record = loginAttempts.get(ip);
  const now = new Date();

  if (record?.blockedUntil && record.blockedUntil > now) {
    const retryAfter = Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000);
    return { allowed: false, retryAfter };
  }

  if (!record || (record.blockedUntil && record.blockedUntil <= now)) {
    loginAttempts.set(ip, { count: 1 });
    return { allowed: true };
  }

  record.count++;

  // 5 başarısız denemeden sonra 15 dakika blokla
  if (record.count >= 5) {
    record.blockedUntil = new Date(now.getTime() + 15 * 60 * 1000);
    return { allowed: false, retryAfter: 900 };
  }

  return { allowed: true };
}

function clearLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  try {
    // Rate limit kontrolü
    const rateLimit = checkLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Çok fazla başarısız deneme. Lütfen bekleyin.',
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': String(rateLimit.retryAfter),
          },
        }
      );
    }

    const body = await request.json() as Record<string, unknown>;

    // Validation
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Email veya şifre geçersiz' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { email, password } = result.data;

    // Authenticate
    const user = await authenticateUser(email, password);

    // Başarılı giriş - rate limit temizle
    clearLoginAttempts(ip);

    // Session oluştur
    await createSession(user.id);

    // Hassas bilgileri çıkar
    const { passwordHash, ...safeUser } = user as any;

    return NextResponse.json(
      { success: true, data: safeUser },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Login error:', error);

    // Kullanıcı bulunamadı → kayıt olması gerektiğini belirt
    if (error instanceof AuthError && error.code === 'USER_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu email ile kayıtlı hesap bulunamadı. Önce kayıt olmanız gerekiyor.',
          code: 'USER_NOT_FOUND',
        },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Yanlış şifre
    return NextResponse.json(
      { success: false, error: 'Email veya şifre hatalı', code: 'WRONG_PASSWORD' },
      { status: 401, headers: SECURITY_HEADERS }
    );
  }
}
