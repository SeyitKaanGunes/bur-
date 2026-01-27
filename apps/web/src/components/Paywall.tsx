'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card } from '@burcum/ui';

interface PaywallProps {
  type: 'monthly' | 'yearly' | 'personal' | 'birth-chart';
  teaser?: string;
  zodiacSign?: string;
}

const PAYWALL_CONTENT = {
  monthly: {
    title: 'Aylık Burç Yorumu',
    icon: '📅',
    description: 'Bu ayın detaylı analizini, önemli tarihleri ve fırsatları keşfet.',
    features: [
      'Ayın genel enerjisi ve teması',
      'Önemli gezegen geçişleri',
      'Aşk, kariyer ve sağlık öngörüleri',
      'Şanslı günler ve dikkat edilmesi gerekenler',
    ],
  },
  yearly: {
    title: 'Yıllık Burç Yorumu',
    icon: '🗓️',
    description: '2025 yılının tüm fırsatlarını ve dönüm noktalarını öğren.',
    features: [
      'Yılın genel teması ve enerjisi',
      'Jüpiter, Satürn ve tutulma etkileri',
      'Aydan aya detaylı öngörüler',
      'Kariyer ve ilişki fırsatları',
    ],
  },
  personal: {
    title: 'Kişisel AI Danışman',
    icon: '🔮',
    description: 'Sorularına özel astrolojik yanıtlar al.',
    features: [
      'Sınırsız kişisel soru sorma',
      'Doğum haritana özel yorumlar',
      'İlişki ve kariyer tavsiyeleri',
      'Günlük yaşam rehberliği',
    ],
  },
  'birth-chart': {
    title: 'Detaylı Doğum Haritası',
    icon: '🌟',
    description: 'Gezegen konumları, evler ve açı yorumlarını keşfet.',
    features: [
      'Tüm gezegen pozisyonları',
      '12 ev analizi',
      'Gezegen açıları ve etkileri',
      'Kişilik analizi raporu',
    ],
  },
};

export function Paywall({ type, teaser, zodiacSign }: PaywallProps) {
  const [isHovered, setIsHovered] = useState(false);
  const content = PAYWALL_CONTENT[type];

  return (
    <Card
      variant="glass"
      padding="lg"
      className="relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-purple-500/10 via-indigo-500/10 to-pink-500/10 transition-opacity duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-50'
        }`}
      />

      {/* Lock Icon */}
      <div className="absolute top-4 right-4">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <span className="text-xl">🔒</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{content.icon}</span>
          <div>
            <h3 className="text-xl font-bold">{content.title}</h3>
            <p className="text-sm text-purple-400">Premium Özellik</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 mb-6">{content.description}</p>

        {/* Teaser (blurred preview) */}
        {teaser && (
          <div className="relative mb-6">
            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-gray-400 line-clamp-3">{teaser}</p>
              {/* Blur overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent rounded-xl flex items-end justify-center pb-4">
                <span className="text-sm text-gray-400">Devamını görmek için Premium'a geç</span>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="space-y-3 mb-6">
          {content.features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-purple-400">✓</span>
              <span className="text-gray-300 text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link href="/premium" className="block">
          <Button variant="primary" className="w-full group">
            <span>Premium'a Yükselt</span>
            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </Button>
        </Link>

        {/* Price hint */}
        <p className="text-center text-sm text-gray-500 mt-3">
          Aylık sadece ₺29.99'dan başlayan fiyatlarla
        </p>
      </div>
    </Card>
  );
}

// Inline teaser paywall - daha minimal versiyon
export function InlinePaywall({ message, type }: { message: string; type: PaywallProps['type'] }) {
  return (
    <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl">
      <div className="flex items-start gap-3">
        <span className="text-2xl">🔒</span>
        <div className="flex-1">
          <p className="text-gray-300 mb-3">{message}</p>
          <Link href="/premium">
            <Button variant="secondary" size="sm">
              Premium'a Geç
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reading limit uyarısı
export function ReadingLimitWarning({ remaining, total }: { remaining: number; total: number }) {
  if (remaining > 1) return null;

  return (
    <div className={`p-3 rounded-xl text-sm ${
      remaining === 0
        ? 'bg-red-500/10 border border-red-500/20 text-red-400'
        : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
    }`}>
      {remaining === 0 ? (
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>Günlük okuma hakkın doldu. Yarın tekrar dene veya </span>
          <Link href="/premium" className="underline font-medium">Premium'a geç</Link>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span>💡</span>
          <span>Son {remaining} okuma hakkın kaldı. </span>
          <Link href="/premium" className="underline font-medium">Sınırsız okuma için Premium</Link>
        </div>
      )}
    </div>
  );
}
