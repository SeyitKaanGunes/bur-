import { ZODIAC_DATA, ZODIAC_SIGNS, type ZodiacSign } from '@burcum/shared';

export function getZodiacSignFromDate(date: Date): ZodiacSign {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  for (const sign of ZODIAC_SIGNS) {
    const { start, end } = ZODIAC_DATA[sign].dateRange;

    // Oğlak burcu yıl geçişi özel durumu
    if (sign === 'capricorn') {
      if (mmdd >= start || mmdd <= end) {
        return sign;
      }
    } else {
      if (mmdd >= start && mmdd <= end) {
        return sign;
      }
    }
  }

  return 'capricorn';
}

export function getElementCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const element1 = ZODIAC_DATA[sign1].element;
  const element2 = ZODIAC_DATA[sign2].element;

  // Aynı element
  if (element1 === element2) {
    return 90;
  }

  // Uyumlu elementler
  const compatible: Record<string, string[]> = {
    ateş: ['hava'],
    hava: ['ateş'],
    toprak: ['su'],
    su: ['toprak'],
  };

  if (compatible[element1]?.includes(element2)) {
    return 75;
  }

  // Zıt elementler
  const opposite: Record<string, string> = {
    ateş: 'su',
    su: 'ateş',
    toprak: 'hava',
    hava: 'toprak',
  };

  if (opposite[element1] === element2) {
    return 40;
  }

  return 55;
}

export function getModalityCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): number {
  const modality1 = ZODIAC_DATA[sign1].modality;
  const modality2 = ZODIAC_DATA[sign2].modality;

  // Aynı modalite
  if (modality1 === modality2) {
    return 60; // Rekabet olabilir
  }

  // Öncü + Sabit = Güçlü kombinasyon
  if (
    (modality1 === 'öncü' && modality2 === 'sabit') ||
    (modality1 === 'sabit' && modality2 === 'öncü')
  ) {
    return 85;
  }

  // Değişken ile kombinasyonlar
  return 70;
}

export function calculateCompatibility(sign1: ZodiacSign, sign2: ZodiacSign): {
  overallScore: number;
  loveScore: number;
  friendshipScore: number;
  workScore: number;
} {
  const elementScore = getElementCompatibility(sign1, sign2);
  const modalityScore = getModalityCompatibility(sign1, sign2);

  // Aynı burç özel durumu
  const sameSigns = sign1 === sign2;
  const sameBonus = sameSigns ? 10 : 0;

  // Karşı burçlar (zodyakta 180 derece)
  const oppositeSignsMap: Partial<Record<ZodiacSign, ZodiacSign>> = {
    aries: 'libra',
    taurus: 'scorpio',
    gemini: 'sagittarius',
    cancer: 'capricorn',
    leo: 'aquarius',
    virgo: 'pisces',
  };
  const isOpposite =
    oppositeSignsMap[sign1] === sign2 ||
    Object.entries(oppositeSignsMap).some(([k, v]) => k === sign2 && v === sign1);
  const oppositeBonus = isOpposite ? 15 : 0; // Karşıtlar çeker

  const overallScore = Math.min(
    100,
    Math.round((elementScore * 0.5 + modalityScore * 0.3 + sameBonus + oppositeBonus) * 1.1)
  );

  // Farklı alan skorları
  const loveScore = Math.min(100, Math.round(overallScore * (isOpposite ? 1.15 : 1)));
  const friendshipScore = Math.min(100, Math.round(overallScore * (sameSigns ? 1.1 : 0.95)));
  const workScore = Math.min(100, Math.round((elementScore * 0.3 + modalityScore * 0.7) * 1.05));

  return {
    overallScore,
    loveScore,
    friendshipScore,
    workScore,
  };
}

export function getZodiacTraits(sign: ZodiacSign): string[] {
  return ZODIAC_DATA[sign].traits;
}

export function getLuckyInfo(sign: ZodiacSign): {
  numbers: number[];
  day: string;
  color: string;
  stone: string;
} {
  const data = ZODIAC_DATA[sign];
  return {
    numbers: data.luckyNumbers,
    day: data.luckyDay,
    color: data.color,
    stone: data.stone,
  };
}
