import { NextResponse } from 'next/server';
import { SECURITY_HEADERS } from '@burcum/shared';
import { getCurrentUser, deleteUserAccount, deleteSession } from '@/lib/auth';

async function handleDeleteAccount() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Giris yapmaniz gerekiyor' },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    await deleteUserAccount(user.id);
    await deleteSession();

    return NextResponse.json(
      { success: true, message: 'Hesabiniz ve ilgili verileriniz kalici olarak silindi.' },
      { status: 200, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { success: false, error: 'Hesap silinirken bir hata olustu. Lutfen tekrar deneyin.' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST() {
  return handleDeleteAccount();
}

export async function DELETE() {
  return handleDeleteAccount();
}
