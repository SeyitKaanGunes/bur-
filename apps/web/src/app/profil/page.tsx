'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@burcum/api-client';
import { Card, Button, ZodiacIcon, ScoreBar } from '@burcum/ui';
import { ZODIAC_DATA, SUBSCRIPTION_LIMITS, type ZodiacSign } from '@burcum/shared';
import Link from 'next/link';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card padding="lg">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/10" />
                <div className="flex-1">
                  <div className="h-6 bg-white/10 rounded w-1/3 mb-2" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    router.push('/giris');
    return null;
  }

  const zodiacData = ZODIAC_DATA[user.zodiacSign as ZodiacSign];
  const limits = SUBSCRIPTION_LIMITS[user.subscriptionTier as keyof typeof SUBSCRIPTION_LIMITS];
  const dailyRemaining = typeof limits.dailyReadings === 'number'
    ? Math.max(0, limits.dailyReadings - (user.dailyReadingsCount || 0))
    : '∞';

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card variant="gradient" padding="lg">
          <div className="flex items-center gap-6">
            <ZodiacIcon sign={user.zodiacSign as ZodiacSign} size="lg" />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-400">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                  {zodiacData.turkishName}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    user.subscriptionTier === 'vip'
                      ? 'bg-amber-500/20 text-amber-400'
                      : user.subscriptionTier === 'premium'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {user.subscriptionTier === 'vip'
                    ? 'VIP'
                    : user.subscriptionTier === 'premium'
                    ? 'Premium'
                    : 'Ücretsiz'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Günlük Kullanım</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold text-indigo-400">{dailyRemaining}</div>
              <div className="text-sm text-gray-400">Kalan Okuma</div>
            </div>
            <div className="p-4 bg-white/5 rounded-xl text-center">
              <div className="text-3xl font-bold text-purple-400">
                {user.dailyReadingsCount || 0}
              </div>
              <div className="text-sm text-gray-400">Bugün Okunan</div>
            </div>
          </div>

          {user.subscriptionTier === 'free' && (
            <Link href="/premium" className="block mt-4">
              <Button variant="primary" className="w-full">
                Premium'a Yükselt - Sınırsız Okuma
              </Button>
            </Link>
          )}
        </Card>

        {/* Burç Info */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Burç Bilgilerin</h2>
          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Güneş Burcu" value={zodiacData.turkishName} />
            <InfoItem label="Element" value={zodiacData.element} />
            <InfoItem label="Gezegen" value={zodiacData.ruler} />
            <InfoItem label="Şanslı Gün" value={zodiacData.luckyDay} />
            <InfoItem label="Doğum Tarihi" value={formatDate(user.birthDate)} />
            {user.birthTime && <InfoItem label="Doğum Saati" value={user.birthTime} />}
          </div>

          {!user.birthTime && (
            <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-sm text-gray-300">
                💡 Doğum saatini ekleyerek yükselen burcunu öğrenebilirsin.
              </p>
              <Button variant="ghost" size="sm" className="mt-2">
                Doğum Saati Ekle
              </Button>
            </div>
          )}
        </Card>

        {/* Email Verification Status */}
        {!user.emailVerifiedAt && (
          <Card padding="lg" className="border-amber-500/30">
            <div className="flex items-start gap-4">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-semibold text-amber-400">Email Doğrulanmadı</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Email adresini doğrulayarak tüm özelliklere erişebilirsin.
                </p>
                <Button variant="secondary" size="sm" className="mt-3">
                  Doğrulama Maili Gönder
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        <Card padding="lg">
          <h2 className="text-lg font-semibold mb-4">Hesap İşlemleri</h2>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start">
              📧 Email Değiştir
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              🔒 Şifre Değiştir
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              🔔 Bildirim Ayarları
            </Button>
            <hr className="border-white/10" />
            <Button variant="danger" className="w-full" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-xl">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-medium capitalize">{value}</div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
