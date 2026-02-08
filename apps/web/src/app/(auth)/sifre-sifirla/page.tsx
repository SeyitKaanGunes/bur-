'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useResetPassword } from '@burcum/api-client';
import { Button, Card, Input } from '@burcum/ui';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <Card variant="glass" padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-4">Geçersiz Link</h1>
          <p className="text-gray-400 mb-6">
            Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
          </p>
          <Link href="/sifremi-unuttum">
            <Button variant="primary" size="md">
              Yeni Link Talep Et
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (success) {
    return (
      <Card variant="glass" padding="lg">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Şifre Değiştirildi</h1>
          <p className="text-gray-400 mb-6">
            Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.
          </p>
          <Link href="/giris">
            <Button variant="primary" size="md">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalı');
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError('En az bir büyük harf gerekli');
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError('En az bir rakam gerekli');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      await resetPassword.mutateAsync({ token, password });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    }
  };

  return (
    <Card variant="glass" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Yeni Şifre Belirle</h1>
        <p className="text-gray-400">Yeni şifreni gir</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <Input
          label="Yeni Şifre"
          name="password"
          type="password"
          placeholder="En az 8 karakter"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Input
          label="Şifre Tekrar"
          name="confirmPassword"
          type="password"
          placeholder="Şifrenizi tekrar girin"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={resetPassword.isPending}
          className="w-full"
        >
          Şifremi Değiştir
        </Button>
      </form>
    </Card>
  );
}
