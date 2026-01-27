import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, type ZodiacSign, SECURITY_HEADERS, getWeekStart, formatDateShort } from '@burcum/shared';
import { generateWeeklyHoroscope } from '@/lib/ai';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const horoscopeCache = new Map<string, { data: any; expiresAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 20;

  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sign: string } }
) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla istek. Lütfen bekleyin.' },
        { status: 429, headers: { ...SECURITY_HEADERS, 'Retry-After': '60' } }
      );
    }

    const sign = params.sign.toLowerCase() as ZodiacSign;
    if (!ZODIAC_SIGNS.includes(sign)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz burç' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const weekStart = formatDateShort(getWeekStart());
    const cacheKey = `weekly:${sign}:${weekStart}`;

    const cached = horoscopeCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(
        { success: true, data: cached.data, cached: true },
        {
          headers: {
            ...SECURITY_HEADERS,
            'X-RateLimit-Remaining': remaining.toString(),
            'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
          },
        }
      );
    }

    const reading = await generateWeeklyHoroscope(sign, weekStart);

    const responseData = {
      id: `${sign}-weekly-${weekStart}`,
      zodiacSign: sign,
      readingType: 'weekly',
      readingDate: weekStart,
      ...reading,
      createdAt: new Date().toISOString(),
    };

    // Cache'e kaydet (24 saat)
    horoscopeCache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    return NextResponse.json(
      { success: true, data: responseData, cached: false },
      {
        headers: {
          ...SECURITY_HEADERS,
          'X-RateLimit-Remaining': remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Weekly horoscope error:', error);
    return NextResponse.json(
      { success: false, error: 'Haftalık yorum oluşturulurken bir hata oluştu' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
