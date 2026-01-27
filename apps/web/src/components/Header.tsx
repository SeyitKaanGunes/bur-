'use client';

import Link from 'next/link';
import { useAuth } from '@burcum/api-client';
import { Button } from '@burcum/ui';
import { ZODIAC_DATA } from '@burcum/shared';

export function Header() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold gradient-text">
            Burcum
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#burclar" className="text-gray-300 hover:text-white transition">
              Burçlar
            </Link>
            <Link href="/uyumluluk" className="text-gray-300 hover:text-white transition">
              Uyumluluk
            </Link>
            <Link href="/premium" className="text-gray-300 hover:text-white transition">
              Premium
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profil"
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition"
                >
                  <span className="text-xl">
                    {user.zodiacSign && ZODIAC_DATA[user.zodiacSign as keyof typeof ZODIAC_DATA]?.symbol}
                  </span>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Çıkış
                </Button>
              </div>
            ) : (
              <>
                <Link href="/giris">
                  <Button variant="ghost" size="sm">
                    Giriş
                  </Button>
                </Link>
                <Link href="/kayit">
                  <Button variant="primary" size="sm">
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
