'use client';

import { useState } from 'react';
import { useDailyHoroscope, useWeeklyHoroscope, useMonthlyHoroscope, useYearlyHoroscope, useAuth } from '@burcum/api-client';
import { Card, ScoreBar } from '@burcum/ui';
import type { ZodiacSign } from '@burcum/shared';
import { Paywall, ReadingLimitWarning } from '@/components/Paywall';

interface HoroscopeContentProps {
  sign: ZodiacSign;
}

type TabType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export function HoroscopeContent({ sign }: HoroscopeContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const { user, isAuthenticated } = useAuth();

  const isPremium = user?.subscriptionTier === 'premium' || user?.subscriptionTier === 'vip';

  const dailyQuery = useDailyHoroscope(sign);
  const weeklyQuery = useWeeklyHoroscope(sign);
  const monthlyQuery = useMonthlyHoroscope(sign, isPremium);
  const yearlyQuery = useYearlyHoroscope(sign, isPremium);

  const getQueryData = () => {
    switch (activeTab) {
      case 'daily':
        return { isLoading: dailyQuery.isLoading, error: dailyQuery.error, data: dailyQuery.data?.data };
      case 'weekly':
        return { isLoading: weeklyQuery.isLoading, error: weeklyQuery.error, data: weeklyQuery.data?.data };
      case 'monthly':
        return { isLoading: monthlyQuery.isLoading, error: monthlyQuery.error, data: monthlyQuery.data?.data };
      case 'yearly':
        return { isLoading: yearlyQuery.isLoading, error: yearlyQuery.error, data: yearlyQuery.data?.data };
    }
  };

  const { isLoading, error, data } = getQueryData();

  // Free user reading limit warning
  const dailyRemaining = user ? (3 - (user.dailyReadingsCount || 0)) : 3;

  return (
    <div>
      {/* Reading Limit Warning */}
      {isAuthenticated && user?.subscriptionTier === 'free' && (
        <div className="mb-4">
          <ReadingLimitWarning remaining={dailyRemaining} total={3} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton active={activeTab === 'daily'} onClick={() => setActiveTab('daily')}>
          Günlük
        </TabButton>
        <TabButton active={activeTab === 'weekly'} onClick={() => setActiveTab('weekly')}>
          Haftalık
        </TabButton>
        <TabButton
          active={activeTab === 'monthly'}
          onClick={() => setActiveTab('monthly')}
          premium={!isPremium}
        >
          Aylık {!isPremium && <span className="text-xs text-amber-400 ml-1">Premium</span>}
        </TabButton>
        <TabButton
          active={activeTab === 'yearly'}
          onClick={() => setActiveTab('yearly')}
          premium={!isPremium}
        >
          Yıllık {!isPremium && <span className="text-xs text-amber-400 ml-1">Premium</span>}
        </TabButton>
      </div>

      {/* Content */}
      {(activeTab === 'monthly' || activeTab === 'yearly') && !isPremium ? (
        <Paywall
          type={activeTab}
          zodiacSign={sign}
          teaser={activeTab === 'monthly'
            ? 'Bu ay kariyer hayatında önemli fırsatlar beliriyor. Özellikle ayın ikinci yarısında...'
            : '2025 yılı senin için dönüm noktası olabilir. Jüpiter\'ün burçtaki hareketi...'
          }
        />
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorMessage />
      ) : data ? (
        <HoroscopeDisplay data={data} type={activeTab} />
      ) : (
        <EmptyState sign={sign} type={activeTab} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  premium,
  children,
}: {
  active: boolean;
  onClick: () => void;
  premium?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
        active
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
          : premium
          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20'
          : 'bg-white/10 text-gray-300 hover:bg-white/20'
      }`}
    >
      {children}
    </button>
  );
}

function HoroscopeDisplay({ data, type }: { data: any; type: TabType }) {
  const typeLabel = {
    daily: 'Günün',
    weekly: 'Haftanın',
    monthly: 'Ayın',
    yearly: 'Yılın',
  }[type];
  return (
    <div className="space-y-6">
      {/* Main Content */}
      <Card variant="gradient" padding="lg">
        <p className="text-lg leading-relaxed">{data.content}</p>
        {data.advice && (
          <div className="mt-6 p-4 bg-white/10 rounded-xl">
            <div className="text-sm text-gray-400 mb-1">{typeLabel} Tavsiyesi</div>
            <p className="font-medium">{data.advice}</p>
          </div>
        )}
      </Card>

      {/* Scores */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <ScoreBar
            label="Aşk"
            score={data.loveScore || 7}
            color="pink"
          />
        </Card>
        <Card>
          <ScoreBar
            label="Kariyer"
            score={data.careerScore || 7}
            color="indigo"
          />
        </Card>
        <Card>
          <ScoreBar
            label="Sağlık"
            score={data.healthScore || 7}
            color="emerald"
          />
        </Card>
      </div>

      {/* Lucky Items */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-400">Şanslı Sayılar</div>
            <div className="font-semibold">
              {data.luckyNumbers?.join(', ') || '3, 7, 12'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Şanslı Renk</div>
            <div className="font-semibold">{data.luckyColor || 'Mor'}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card padding="lg">
        <div className="h-4 bg-white/10 rounded w-full mb-3" />
        <div className="h-4 bg-white/10 rounded w-5/6 mb-3" />
        <div className="h-4 bg-white/10 rounded w-4/6" />
      </Card>
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="h-8 bg-white/10 rounded" />
          </Card>
        ))}
      </div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <Card variant="default" padding="lg">
      <div className="text-center text-red-400">
        <p>Yorum yüklenirken bir hata oluştu.</p>
        <p className="text-sm mt-2">Lütfen daha sonra tekrar deneyin.</p>
      </div>
    </Card>
  );
}

function EmptyState({ sign, type }: { sign: ZodiacSign; type: TabType }) {
  return (
    <Card variant="gradient" padding="lg">
      <div className="text-center">
        <p className="text-gray-300">
          {type === 'daily' ? 'Günlük' : 'Haftalık'} yorum henüz hazırlanmadı.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Yorumlar her gün güncellenmektedir.
        </p>
      </div>
    </Card>
  );
}
