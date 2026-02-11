export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const ZODIAC_DATA: Record<
  ZodiacSign,
  {
    turkishName: string;
    symbol: string;
    element: 'ateş' | 'toprak' | 'hava' | 'su';
    modality: 'öncü' | 'sabit' | 'değişken';
    ruler: string;
    dateRange: { start: string; end: string };
    traits: string[];
    luckyNumbers: number[];
    luckyDay: string;
    color: string;
    stone: string;
  }
> = {
  aries: {
    turkishName: 'Koç',
    symbol: '♈',
    element: 'ateş',
    modality: 'öncü',
    ruler: 'Mars',
    dateRange: { start: '03-21', end: '04-19' },
    traits: ['cesur', 'enerjik', 'öncü', 'rekabetçi', 'tutkulu'],
    luckyNumbers: [1, 9, 17],
    luckyDay: 'Salı',
    color: 'Kırmızı',
    stone: 'Elmas',
  },
  taurus: {
    turkishName: 'Boğa',
    symbol: '♉',
    element: 'toprak',
    modality: 'sabit',
    ruler: 'Venüs',
    dateRange: { start: '04-20', end: '05-20' },
    traits: ['güvenilir', 'sabırlı', 'pratik', 'sadık', 'duyusal'],
    luckyNumbers: [2, 6, 24],
    luckyDay: 'Cuma',
    color: 'Yeşil',
    stone: 'Zümrüt',
  },
  gemini: {
    turkishName: 'İkizler',
    symbol: '♊',
    element: 'hava',
    modality: 'değişken',
    ruler: 'Merkür',
    dateRange: { start: '05-21', end: '06-20' },
    traits: ['meraklı', 'uyumlu', 'iletişimci', 'zeki', 'çok yönlü'],
    luckyNumbers: [3, 5, 14],
    luckyDay: 'Çarşamba',
    color: 'Sarı',
    stone: 'Akik',
  },
  cancer: {
    turkishName: 'Yengeç',
    symbol: '♋',
    element: 'su',
    modality: 'öncü',
    ruler: 'Ay',
    dateRange: { start: '06-21', end: '07-22' },
    traits: ['duygusal', 'koruyucu', 'sezgisel', 'sadık', 'şefkatli'],
    luckyNumbers: [2, 7, 11],
    luckyDay: 'Pazartesi',
    color: 'Gümüş',
    stone: 'İnci',
  },
  leo: {
    turkishName: 'Aslan',
    symbol: '♌',
    element: 'ateş',
    modality: 'sabit',
    ruler: 'Güneş',
    dateRange: { start: '07-23', end: '08-22' },
    traits: ['yaratıcı', 'cömert', 'karizmatik', 'lider', 'dramatik'],
    luckyNumbers: [1, 4, 19],
    luckyDay: 'Pazar',
    color: 'Altın',
    stone: 'Yakut',
  },
  virgo: {
    turkishName: 'Başak',
    symbol: '♍',
    element: 'toprak',
    modality: 'değişken',
    ruler: 'Merkür',
    dateRange: { start: '08-23', end: '09-22' },
    traits: ['analitik', 'çalışkan', 'pratik', 'detaycı', 'yardımsever'],
    luckyNumbers: [5, 14, 23],
    luckyDay: 'Çarşamba',
    color: 'Lacivert',
    stone: 'Safir',
  },
  libra: {
    turkishName: 'Terazi',
    symbol: '♎',
    element: 'hava',
    modality: 'öncü',
    ruler: 'Venüs',
    dateRange: { start: '09-23', end: '10-22' },
    traits: ['diplomatik', 'zarif', 'adil', 'sosyal', 'romantik'],
    luckyNumbers: [6, 15, 24],
    luckyDay: 'Cuma',
    color: 'Pembe',
    stone: 'Opal',
  },
  scorpio: {
    turkishName: 'Akrep',
    symbol: '♏',
    element: 'su',
    modality: 'sabit',
    ruler: 'Plüton',
    dateRange: { start: '10-23', end: '11-21' },
    traits: ['tutkulu', 'kararlı', 'gizemli', 'güçlü', 'sezgisel'],
    luckyNumbers: [8, 11, 18],
    luckyDay: 'Salı',
    color: 'Bordo',
    stone: 'Topaz',
  },
  sagittarius: {
    turkishName: 'Yay',
    symbol: '♐',
    element: 'ateş',
    modality: 'değişken',
    ruler: 'Jüpiter',
    dateRange: { start: '11-22', end: '12-21' },
    traits: ['iyimser', 'maceraperest', 'özgür', 'felsefi', 'dürüst'],
    luckyNumbers: [3, 12, 21],
    luckyDay: 'Perşembe',
    color: 'Mor',
    stone: 'Turkuaz',
  },
  capricorn: {
    turkishName: 'Oğlak',
    symbol: '♑',
    element: 'toprak',
    modality: 'öncü',
    ruler: 'Satürn',
    dateRange: { start: '12-22', end: '01-19' },
    traits: ['disiplinli', 'hırslı', 'sorumlu', 'sabırlı', 'pratik'],
    luckyNumbers: [4, 8, 22],
    luckyDay: 'Cumartesi',
    color: 'Kahverengi',
    stone: 'Garnet',
  },
  aquarius: {
    turkishName: 'Kova',
    symbol: '♒',
    element: 'hava',
    modality: 'sabit',
    ruler: 'Uranüs',
    dateRange: { start: '01-20', end: '02-18' },
    traits: ['yenilikçi', 'bağımsız', 'insancıl', 'orijinal', 'entelektüel'],
    luckyNumbers: [4, 7, 11],
    luckyDay: 'Cumartesi',
    color: 'Mavi',
    stone: 'Ametist',
  },
  pisces: {
    turkishName: 'Balık',
    symbol: '♓',
    element: 'su',
    modality: 'değişken',
    ruler: 'Neptün',
    dateRange: { start: '02-19', end: '03-20' },
    traits: ['hayalperest', 'empatik', 'sanatsal', 'sezgisel', 'şefkatli'],
    luckyNumbers: [3, 9, 12],
    luckyDay: 'Perşembe',
    color: 'Deniz Mavisi',
    stone: 'Akvamarin',
  },
};

export function getZodiacSign(birthDate: Date): ZodiacSign {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  const mmdd = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  for (const [sign, data] of Object.entries(ZODIAC_DATA)) {
    const { start, end } = data.dateRange;

    // Oğlak burcu yıl geçişi
    if (sign === 'capricorn') {
      if (mmdd >= start || mmdd <= end) {
        return sign as ZodiacSign;
      }
    } else {
      if (mmdd >= start && mmdd <= end) {
        return sign as ZodiacSign;
      }
    }
  }

  return 'capricorn'; // Fallback
}

export function getZodiacSignTurkish(sign: ZodiacSign): string {
  return ZODIAC_DATA[sign].turkishName;
}

// Türkçe burç ismi → İngilizce key mapping
const TURKISH_TO_ENGLISH: Record<string, ZodiacSign> = {
  'koç': 'aries', 'koc': 'aries',
  'boğa': 'taurus', 'boga': 'taurus',
  'ikizler': 'gemini',
  'yengeç': 'cancer', 'yengec': 'cancer',
  'aslan': 'leo',
  'başak': 'virgo', 'basak': 'virgo',
  'terazi': 'libra',
  'akrep': 'scorpio',
  'yay': 'sagittarius',
  'oğlak': 'capricorn', 'oglak': 'capricorn',
  'kova': 'aquarius',
  'balık': 'pisces', 'balik': 'pisces',
};

/**
 * Resolve a zodiac sign from either English key or Turkish name.
 * Returns the English ZodiacSign key, or null if not found.
 */
export function resolveZodiacSign(input: string): ZodiacSign | null {
  const lower = input.toLowerCase().trim();

  // First check if it's already a valid English key
  if (ZODIAC_SIGNS.includes(lower as ZodiacSign)) {
    return lower as ZodiacSign;
  }

  // Try Turkish → English mapping
  return TURKISH_TO_ENGLISH[lower] || null;
}
