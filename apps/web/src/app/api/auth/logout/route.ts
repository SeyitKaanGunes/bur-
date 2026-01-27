import { NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@burcum/shared';
import { deleteSession } from '@/lib/auth';

export async function POST() {
  try {
    await deleteSession();

    return NextResponse.json(
      { success: true, message: 'Başarıyla çıkış yapıldı' },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Çıkış yapılırken bir hata oluştu' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
