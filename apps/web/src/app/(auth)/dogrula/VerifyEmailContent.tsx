'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useVerifyEmail } from '@burcum/api-client';
import { Card, Button } from '@burcum/ui';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyEmail = useVerifyEmail();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Doğrulama kodu bulunamadı');
      return;
    }

    verifyEmail.mutate(token, {
      onSuccess: () => {
        setStatus('success');
        setMessage('Email adresiniz başarıyla doğrulandı!');
      },
      onError: (error) => {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Doğrulama başarısız oldu');
      },
    });
  }, [token]);

  return (
    <Card variant="glass" padding="lg">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4 animate-pulse">🔮</div>
            <h1 className="text-2xl font-bold mb-2">Doğrulanıyor...</h1>
            <p className="text-gray-400">Email adresiniz doğrulanıyor, lütfen bekleyin.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold mb-2 text-green-400">Doğrulandı!</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <Button variant="primary" onClick={() => router.push('/')}>
              Ana Sayfaya Git
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2 text-red-400">Hata</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="space-y-3">
              <Button variant="primary" onClick={() => router.push('/kayit')}>
                Yeniden Kayıt Ol
              </Button>
              <div>
                <Link href="/" className="text-indigo-400 hover:text-indigo-300 text-sm">
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
