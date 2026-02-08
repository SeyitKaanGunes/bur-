import { NextRequest, NextResponse } from 'next/server';
import { registerSchema, getZodiacSign, SECURITY_HEADERS } from '@burcum/shared';
import { createUser, createSession } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json(
        { success: false, error: errors },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const { email, password, name, birthDate, birthTime, birthCity } = result.data;

    // Burç hesapla
    const zodiacSign = getZodiacSign(new Date(birthDate));

    // Kullanıcı oluştur
    const { user, verificationToken } = await createUser({
      email,
      password,
      name,
      birthDate,
      birthTime,
      birthCity,
      zodiacSign,
    });

    // Session oluştur
    await createSession(user.id);

    // Doğrulama emaili gönder
    if (process.env.RESEND_API_KEY) {
      try {
        await sendVerificationEmail(email, verificationToken, name);
      } catch (e) {
        console.error('Verification email failed:', e);
      }
    }

    // Hassas bilgileri çıkar
    const { passwordHash, ...safeUser } = user as any;

    return NextResponse.json(
      {
        success: true,
        data: safeUser,
        message: 'Hesabınız oluşturuldu. Lütfen email adresinizi doğrulayın.',
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Register error:', error);
    const message = error instanceof Error ? error.message : 'Kayıt sırasında bir hata oluştu';
    return NextResponse.json(
      { success: false, error: message },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }
}
