import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, type ZodiacSign, SECURITY_HEADERS, getMonthStart, formatDateShort, resolveZodiacSign } from '@burcum/shared';
import { getCurrentUser } from '@/lib/auth';
import { generateMonthlyHoroscope } from '@/lib/ai';

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
          error: 'Aylık yorumlar Premium üyelere özeldir',
          requiresPremium: true,
          teaser: 'Bu ay kariyer ve aşk hayatınızda önemli gelişmeler...',
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

    const monthStart = formatDateShort(getMonthStart());
    const cacheKey = `monthly:${sign}:${monthStart}`;

    const cached = horoscopeCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json(
        { success: true, data: cached.data, cached: true },
        { headers: SECURITY_HEADERS }
      );
    }

    const reading = await generateMonthlyHoroscope(sign, monthStart);

    const responseData = {
      id: `${sign}-monthly-${monthStart}`,
      zodiacSign: sign,
      readingType: 'monthly',
      readingDate: monthStart,
      ...reading,
      createdAt: new Date().toISOString(),
    };

    // Cache 7 gün
    horoscopeCache.set(cacheKey, {
      data: responseData,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    return NextResponse.json(
      { success: true, data: responseData, cached: false },
      { headers: SECURITY_HEADERS }
    );
  } catch (error: any) {
    const errorMessage = error?.message || 'Bilinmeyen hata';
    console.error('Monthly horoscope error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: 'Aylık yorum oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 503, headers: { ...SECURITY_HEADERS, 'Retry-After': '30' } }
    );
  }
}
