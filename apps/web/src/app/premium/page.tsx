'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@burcum/api-client';
import { Card, Button } from '@burcum/ui';
import { SUBSCRIPTION_PRICES } from '@burcum/shared';

type BillingPeriod = 'monthly' | 'yearly';

export default function PremiumPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'premium' | 'vip' | null>(null);

  const handleSubscribe = (plan: 'premium' | 'vip') => {
    if (!isAuthenticated) {
      router.push('/kayit?redirect=/premium');
      return;
    }
    setSelectedPlan(plan);
    // TODO: RevenueCat entegrasyonu
    alert('Ödeme sistemi yakında aktif olacak!');
  };

  const getPrice = (plan: 'premium' | 'vip') => {
    const prices = SUBSCRIPTION_PRICES[plan];
    return billingPeriod === 'monthly' ? prices.monthly : prices.yearly;
  };

  const getSavings = (plan: 'premium' | 'vip') => {
    const prices = SUBSCRIPTION_PRICES[plan];
    const yearlyMonthly = prices.yearly / 12;
    const savings = ((prices.monthly - yearlyMonthly) / prices.monthly) * 100;
    return Math.round(savings);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Premium'a Yükselt</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Sınırsız burç yorumları, kişisel AI danışman ve daha fazlası için Premium'u keşfet.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex items-center gap-4 p-2 bg-white/5 rounded-xl">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-lg transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yıllık
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              2 Ay Hediye
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Free Plan */}
        <Card padding="lg" className="relative">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Ücretsiz</h3>
            <div className="text-4xl font-bold mb-1">₺0</div>
            <div className="text-sm text-gray-500">Sonsuza kadar</div>
          </div>

          <ul className="space-y-3 mb-8">
            <FeatureItem included>Günlük burç yorumu (3/gün)</FeatureItem>
            <FeatureItem included>Haftalık yorum (1/hafta)</FeatureItem>
            <FeatureItem included>Burç uyumluluğu (2/gün)</FeatureItem>
            <FeatureItem included>Basit doğum haritası</FeatureItem>
            <FeatureItem>Aylık yorum</FeatureItem>
            <FeatureItem>Yıllık yorum</FeatureItem>
            <FeatureItem>Reklamsız deneyim</FeatureItem>
            <FeatureItem>Kişisel AI danışman</FeatureItem>
          </ul>

          <Button variant="secondary" className="w-full" disabled>
            Mevcut Plan
          </Button>
        </Card>

        {/* Premium Plan */}
        <Card
          variant="gradient"
          padding="lg"
          className="relative border-2 border-indigo-500 scale-105"
        >
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
              En Popüler
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Premium</h3>
            <div className="text-4xl font-bold mb-1">
              ₺{getPrice('premium').toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              {billingPeriod === 'monthly' ? '/ ay' : '/ yıl'}
            </div>
            {billingPeriod === 'yearly' && (
              <div className="text-sm text-green-400 mt-1">
                %{getSavings('premium')} tasarruf
              </div>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            <FeatureItem included>Sınırsız günlük okuma</FeatureItem>
            <FeatureItem included>Sınırsız haftalık yorum</FeatureItem>
            <FeatureItem included>Aylık detaylı yorum</FeatureItem>
            <FeatureItem included>Yıllık burç raporu</FeatureItem>
            <FeatureItem included>Sınırsız uyumluluk</FeatureItem>
            <FeatureItem included>Detaylı doğum haritası</FeatureItem>
            <FeatureItem included>Reklamsız deneyim</FeatureItem>
            <FeatureItem included>Email raporları</FeatureItem>
            <FeatureItem>Kişisel AI danışman</FeatureItem>
          </ul>

          <Button
            variant="primary"
            className="w-full cosmic-glow"
            onClick={() => handleSubscribe('premium')}
          >
            Premium'a Geç
          </Button>
        </Card>

        {/* VIP Plan */}
        <Card padding="lg" className="relative border border-amber-500/30">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
              ✨ VIP
            </span>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">VIP</h3>
            <div className="text-4xl font-bold mb-1 text-amber-400">
              ₺{getPrice('vip').toFixed(2)}
            </div>
            <div className="text-sm text-gray-400">
              {billingPeriod === 'monthly' ? '/ ay' : '/ yıl'}
            </div>
            {billingPeriod === 'yearly' && (
              <div className="text-sm text-green-400 mt-1">
                %{getSavings('vip')} tasarruf
              </div>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            <FeatureItem included>Tüm Premium özellikleri</FeatureItem>
            <FeatureItem included special>Kişisel AI danışman</FeatureItem>
            <FeatureItem included special>Detaylı transit analizleri</FeatureItem>
            <FeatureItem included special>Özel astroloji raporları</FeatureItem>
            <FeatureItem included>Öncelikli destek</FeatureItem>
            <FeatureItem included>Özel bildirimler</FeatureItem>
            <FeatureItem included>Beta özelliklere erişim</FeatureItem>
          </ul>

          <Button
            variant="secondary"
            className="w-full border-amber-500/50 hover:bg-amber-500/20"
            onClick={() => handleSubscribe('vip')}
          >
            VIP'e Geç
          </Button>
        </Card>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Sık Sorulan Sorular</h2>
        <div className="space-y-4">
          <FaqItem question="İstediğim zaman iptal edebilir miyim?">
            Evet, aboneliğinizi istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde,
            dönem sonuna kadar Premium özelliklerden yararlanmaya devam edersiniz.
          </FaqItem>
          <FaqItem question="Ödeme güvenli mi?">
            Tüm ödemeler SSL şifrelemesi ile korunmaktadır. Kredi kartı bilgileriniz
            güvenli ödeme altyapımız tarafından işlenir ve bizde saklanmaz.
          </FaqItem>
          <FaqItem question="Yıllık plana geçersem ne olur?">
            Yıllık plana geçtiğinizde 2 ay ücretsiz kullanım hakkı kazanırsınız.
            Aylık ödeme yerine yılda bir kez ödeme yaparsınız.
          </FaqItem>
          <FaqItem question="Kişisel AI danışman nasıl çalışıyor?">
            VIP üyeler, astroloji hakkında kişisel sorular sorabilir ve AI danışmanımız
            doğum haritanıza göre özelleştirilmiş yanıtlar verir.
          </FaqItem>
        </div>
      </div>

      {/* Guarantee */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-xl">
          <span className="text-2xl">🛡️</span>
          <span className="text-gray-300">7 Gün Para İade Garantisi</span>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  children,
  included = false,
  special = false,
}: {
  children: React.ReactNode;
  included?: boolean;
  special?: boolean;
}) {
  return (
    <li className="flex items-center gap-3">
      {included ? (
        <span className={`text-lg ${special ? 'text-amber-400' : 'text-green-400'}`}>✓</span>
      ) : (
        <span className="text-lg text-gray-600">✗</span>
      )}
      <span className={included ? 'text-gray-200' : 'text-gray-500'}>{children}</span>
    </li>
  );
}

function FaqItem({ question, children }: { question: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="glass rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition"
      >
        <span className="font-medium">{question}</span>
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-400">
          {children}
        </div>
      )}
    </div>
  );
}
