'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLogin, ApiError } from '@burcum/api-client';
import { Button, Card, Input } from '@burcum/ui';

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [showRegisterHint, setShowRegisterHint] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setShowRegisterHint(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Email ve şifre gerekli');
      return;
    }

    try {
      await login.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Cookie'nin set edilmesi için kısa bekleme
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push('/');
      router.refresh(); // Server component'leri da yeniden yükle
    } catch (err) {
      // Kullanıcı bulunamadı → kayıt olması gerektiğini belirt
      if (err instanceof ApiError && err.data && (err.data as any).code === 'USER_NOT_FOUND') {
        setShowRegisterHint(true);
        setError('Bu email ile kayıtlı hesap bulunamadı.');
      } else {
        setShowRegisterHint(false);
        setError(err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu');
      }
    }
  };

  return (
    <Card variant="glass" padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Giriş Yap</h1>
        <p className="text-gray-400">Hesabına giriş yaparak devam et</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className={`p-3 rounded-xl text-sm ${showRegisterHint ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
            <p>{error}</p>
            {showRegisterHint && (
              <Link
                href="/kayit"
                className="mt-2 inline-block font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
              >
                Hemen Kayıt Ol &rarr;
              </Link>
            )}
          </div>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="ornek@email.com"
          value={formData.email}
          onChange={handleChange}
        />

        <Input
          label="Şifre"
          name="password"
          type="password"
          placeholder="Şifreniz"
          value={formData.password}
          onChange={handleChange}
        />

        <div className="flex justify-end">
          <Link
            href="/sifremi-unuttum"
            className="text-sm text-indigo-400 hover:text-indigo-300"
          >
            Şifremi Unuttum
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={login.isPending}
          className="w-full"
        >
          Giriş Yap
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-400">
        Hesabın yok mu?{' '}
        <Link href="/kayit" className="text-indigo-400 hover:text-indigo-300">
          Kayıt Ol
        </Link>
      </div>

      {/* Social Login (ileride eklenebilir) */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-transparent text-gray-500">veya</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            disabled
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-400 cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"
              />
            </svg>
            Apple
          </button>
        </div>
        <p className="text-xs text-center text-gray-600 mt-2">Yakında</p>
      </div>
    </Card>
  );
}
