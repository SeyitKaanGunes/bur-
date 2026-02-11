import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, type ZodiacSign, SECURITY_HEADERS, resolveZodiacSign } from '@burcum/shared';
import { getCurrentUser } from '@/lib/auth';
import { generateYearlyHoroscope } from '@/lib/ai';

const horoscopeCache = new Map<string, { data: any; expiresAt: number }>();

export async function GET(
  request: NextRequest,
  { params }: { params: { sign: string } }
) {
  try {
    // Auth kontrolü - Premium gerekli
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giriş yapmanız gerekiyor', requiresAuth: true },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    if (user.subscriptionTier === 'free') {
      return NextResponse.json(
        {
          success: false,
          error: 'Yıllık yorumlar Premium üyelere özeldir',
          requiresPremium: true,
          teaser: '2024 yılı sizin için büyük değişimler ve fırsatlar getiriyor...',
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Burç doğrulama (Türkçe ve İngilizce isim desteği)
    const sign = resolveZodiacSign(params.sign);
    if (!sign) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz burç' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const year = new Date().getFullYear().toString();
    const cacheKey = `yearly:${sign}:${year}`;

    const cached = horoscopeCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(
        { success: true, data: cached.data, cached: true },
        { headers: SECURITY_HEADERS }
      );
    }

    const reading = await generateYearlyHoroscope(sign, year);

    const responseData = {
      id: `${sign}-yearly-${year}`,
      zodiacSign: sign,
      readingType: 'yearly',
      readingDate: year,
      ...reading,
      createdAt: new Date().toISOString(),
    };

    // Cache 30 gün
    horoscopeCache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json(
      { success: true, data: responseData, cached: false },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    const errorMessage = error?.message || 'Bilinmeyen hata';
    console.error('Yearly horoscope error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Yıllık yorum oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 503, headers: { ...SECURITY_HEADERS, 'Retry-After': '30' } }
    );
  }
}
