import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@burcum/shared';
import { verifyEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { token?: string };
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Doğrulama kodu gerekli' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    await verifyEmail(token);

    return NextResponse.json(
      { success: true, message: 'Email adresiniz başarıyla doğrulandı' },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    const message =
      error instanceof Error ? error.message : 'Email doğrulama sırasında bir hata oluştu';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }
}
