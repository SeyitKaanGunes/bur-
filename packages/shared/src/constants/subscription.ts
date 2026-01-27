export const SUBSCRIPTION_TIERS = ['free', 'premium', 'vip'] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const SUBSCRIPTION_LIMITS = {
  free: {
    dailyReadings: 3,
    weeklyReadings: 1,
    monthlyReadings: 0,
    yearlyReadings: 0,
    compatibilityChecks: 2,
    personalReadings: 0,
    birthChartDetails: 'basic' as const,
    hasAds: true,
    emailReports: false,
    pushNotifications: true,
    aiPersonalization: false,
  },
  premium: {
    dailyReadings: Infinity,
    weeklyReadings: Infinity,
    monthlyReadings: Infinity,
    yearlyReadings: 1,
    compatibilityChecks: Infinity,
    personalReadings: 5,
    birthChartDetails: 'detailed' as const,
    hasAds: false,
    emailReports: true,
    pushNotifications: true,
    aiPersonalization: true,
  },
  vip: {
    dailyReadings: Infinity,
    weeklyReadings: Infinity,
    monthlyReadings: Infinity,
    yearlyReadings: Infinity,
    compatibilityChecks: Infinity,
    personalReadings: Infinity,
    birthChartDetails: 'full' as const,
    hasAds: false,
    emailReports: true,
    pushNotifications: true,
    aiPersonalization: true,
    prioritySupport: true,
    transitAnalysis: true,
  },
} as const;

export const SUBSCRIPTION_PRICES = {
  premium: {
    monthly: 29.99,
    yearly: 249.99,
    currency: 'TRY',
  },
  vip: {
    monthly: 49.99,
    yearly: 449.99,
    currency: 'TRY',
  },
} as const;

export interface LimitCheckResult {
  allowed: boolean;
  remaining: number;
  upgradePrompt?: string;
}

export function checkLimit(
  tier: SubscriptionTier,
  action: keyof (typeof SUBSCRIPTION_LIMITS)['free'],
  currentCount: number
): LimitCheckResult {
  const limit = SUBSCRIPTION_LIMITS[tier][action as keyof (typeof SUBSCRIPTION_LIMITS)[typeof tier]];

  if (limit === Infinity) {
    return { allowed: true, remaining: Infinity };
  }

  if (typeof limit === 'number') {
    const remaining = Math.max(0, limit - currentCount);
    return {
      allowed: currentCount < limit,
      remaining,
      upgradePrompt: remaining === 0 ? getUpgradePrompt(action as string) : undefined,
    };
  }

  return { allowed: !!limit, remaining: limit ? 1 : 0 };
}

function getUpgradePrompt(action: string): string {
  const prompts: Record<string, string> = {
    dailyReadings: 'Günlük okuma limitinize ulaştınız. Premium ile sınırsız okuma yapın!',
    weeklyReadings: 'Haftalık yorum limitinize ulaştınız. Premium ile sınırsız erişim kazanın!',
    monthlyReadings: 'Aylık yorumlar Premium üyelere özel.',
    yearlyReadings: 'Yıllık detaylı yorumunuz Premium ile açılır.',
    compatibilityChecks: 'Daha fazla uyumluluk analizi için Premium\'a geçin.',
    personalReadings: 'Kişisel AI yorumları için Premium üyelik gerekli.',
  };
  return prompts[action] || 'Daha fazlası için Premium\'a geçin.';
}
