import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS, generateToken } from '@burcum/shared';
import { getUserByEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { passwordResetTokens } from '@/lib/password-reset';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email adresi gerekli' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const user = await getUserByEmail(email);

    // Güvenlik: Kullanıcı bulunamasa bile aynı mesajı dön
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi.' },
        { status: 200, headers: SECURITY_HEADERS }
      );
    }

    const token = generateToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    // Token'ı kaydet
    passwordResetTokens.set(token, {
      userId: user.id,
      email: user.email,
      name: user.name,
      expiresAt,
    });

    // Email gönder
    if (process.env.RESEND_API_KEY) {
      try {
        await sendPasswordResetEmail(user.email, token, user.name);
      } catch (e) {
        console.error('Password reset email failed:', e);
      }
    }

    return NextResponse.json(
      { success: true, message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama linki gönderildi.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
