import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, type ZodiacSign, SECURITY_HEADERS, getToday } from '@burcum/shared';
import { generateDailyHoroscope } from '@/lib/ai';

// Rate limiting için basit in-memory store (production'da KV kullan)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 dakika
  const maxRequests = 30;

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

// Cache için basit store (LRU benzeri)
const horoscopeCache = new Map<string, { data: any; expiresAt: number }>();
const MAX_CACHE_SIZE = 100; // Maksimum 100 entry (12 burç * ~8 gün)

// Cache temizleme (memory leak önleme)
function cleanupCache() {
  const now = Date.now();
  let deleted = 0;

  // Süresi dolmuş entry'leri temizle
  for (const [key, value] of horoscopeCache.entries()) {
    if (now > value.expiresAt) {
      horoscopeCache.delete(key);
      deleted++;
    }
  }

  // Hala çok fazla entry varsa en eski yarısını sil
  if (horoscopeCache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(horoscopeCache.entries());
    entries.slice(0, Math.floor(entries.length / 2)).forEach(([key]) => {
      horoscopeCache.delete(key);
    });
  }

  return deleted;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sign: string } }
) {
  try {
    // IP al
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    // Rate limit kontrolü
    const { allowed, remaining } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Çok fazla istek. Lütfen bekleyin.' },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            'Retry-After': '60',
          },
        }
      );
    }

    // Burç doğrulama
    const sign = params.sign.toLowerCase() as ZodiacSign;
    if (!ZODIAC_SIGNS.includes(sign)) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz burç' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const today = getToday();
    const cacheKey = `daily:${sign}:${today}`;

    // Periyodik cache temizliği (%10 ihtimalle)
    if (Math.random() < 0.1) {
      cleanupCache();
    }

    // Cache kontrolü
    const cached = horoscopeCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(
        { success: true, data: cached.data, cached: true },
        {
          headers: {
            ...SECURITY_HEADERS,
            'X-RateLimit-Remaining': remaining.toString(),
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        }
      );
    }

    // AI ile yeni yorum oluştur
    const reading = await generateDailyHoroscope(sign, today);

    const responseData = {
      id: `${sign}-daily-${today}`,
      zodiacSign: sign,
      readingType: 'daily',
      readingDate: today,
      ...reading,
      createdAt: new Date().toISOString(),
    };

    // Cache'e kaydet (1 saat)
    horoscopeCache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + 60 * 60 * 1000,
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
    console.error('Daily horoscope error:', error);
    return NextResponse.json(
      { success: false, error: 'Yorum oluşturulurken bir hata oluştu' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
