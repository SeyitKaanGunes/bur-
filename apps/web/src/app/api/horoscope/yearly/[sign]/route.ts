import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, type ZodiacSign, SECURITY_HEADERS } from '@burcum/shared';
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

    const sign = params.sign.toLowerCase() as ZodiacSign;
    if (!ZODIAC_SIGNS.includes(sign)) {
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
  } catch (error) {
    console.error('Yearly horoscope error:', error);
    return NextResponse.json(
      { success: false, error: 'Yıllık yorum oluşturulurken bir hata oluştu' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
