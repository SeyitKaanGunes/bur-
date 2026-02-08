import { NextRequest, NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@burcum/shared';
import { hashPassword } from '@burcum/shared';
import { passwordResetTokens } from '@/lib/password-reset';

// In-memory users referansı (auth.ts ile paylaşılan)
// Not: Serverless ortamda bu sınırlıdır, D1 entegrasyonu ile çözülecek
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token ve yeni şifre gerekli' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Şifre en az 8 karakter olmalı' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const tokenData = passwordResetTokens.get(token);

    if (!tokenData) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz veya süresi dolmuş sıfırlama linki' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (tokenData.expiresAt < new Date()) {
      passwordResetTokens.delete(token);
      return NextResponse.json(
        { success: false, error: 'Sıfırlama linkinin süresi dolmuş. Lütfen yeni bir istek gönderin.' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Token'ı sil (tek kullanımlık)
    passwordResetTokens.delete(token);

    return NextResponse.json(
      { success: true, message: 'Şifreniz başarıyla değiştirildi. Giriş yapabilirsiniz.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
