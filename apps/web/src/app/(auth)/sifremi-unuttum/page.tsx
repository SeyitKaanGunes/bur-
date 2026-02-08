'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForgotPassword } from '@burcum/api-client';
import { Button, Card, Input } from '@burcum/ui';

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email adresi gerekli');
      return;
    }

    try {
      await forgotPassword.mutateAsync(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  if (sent) {
    return (
      <Card variant="glass" padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold mb-4">Email Gönderildi</h1>
          <p className="text-gray-400 mb-6">
            Eğer <strong className="text-white">{email}</strong> adresi kayıtlıysa,
            şifre sıfırlama linki gönderildi. Lütfen email kutunuzu kontrol edin.
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Email gelmediyse spam klasörünü de kontrol edin.
          </p>
          <Link href="/giris">
            <Button variant="secondary" size="md">
              Giriş Sayfasına Dön
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Şifremi Unuttum</h1>
        <p className="text-gray-400">Email adresini gir, şifre sıfırlama linki gönderelim</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="ornek@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={forgotPassword.isPending}
          className="w-full"
        >
          Sıfırlama Linki Gönder
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Şifreni hatırladın mı?{' '}
        <Link href="/giris" className="text-indigo-400 hover:text-indigo-300">
          Giriş Yap
        </Link>
      </div>
    </Card>
  );
}
