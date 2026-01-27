import { NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@burcum/shared';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Oturum bulunamadı' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, data: user },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, error: 'Kullanıcı bilgisi alınamadı' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
