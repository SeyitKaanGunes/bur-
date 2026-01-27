import Groq from 'groq-sdk';
import { ZODIAC_DATA, type ZodiacSign, sanitizeUserInput, isValidAstrologyQuestion } from '@burcum/shared';

// Lazy initialization - sadece API çağrısı yapıldığında kontrol edilir
let groqInstance: Groq | null = null;

function getGroqClient(): Groq {
  if (groqInstance) {
    return groqInstance;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  // API key format kontrolü (gsk_ ile başlamalı)
  if (!apiKey.startsWith('gsk_')) {
    throw new Error('Invalid GROQ_API_KEY format');
  }

  groqInstance = new Groq({ apiKey });
  return groqInstance;
}

const SYSTEM_PROMPT = `Sen deneyimli ve bilge bir Türk astrologsun. Türkçe burç yorumları yazıyorsun.

KURALLAR:
1. Sadece astroloji ve burç yorumları hakkında konuş
2. Kişisel, sıcak, umut verici ama gerçekçi bir dil kullan
3. Kesinlikle sağlık, finansal veya hukuki tavsiye verme - sadece genel enerji yorumları yap
4. Yorumları 150-250 kelime arasında tut
5. Günün/haftanın enerjisini, gezegen geçişlerini ve element uyumunu dahil et
6. Her zaman pozitif bir not ile bitir

FORMAT (JSON):
{
  "content": "Ana yorum metni - akıcı ve etkileyici",
  "loveScore": 1-10 arası puan,
  "careerScore": 1-10 arası puan,
  "healthScore": 1-10 arası puan,
  "luckyNumbers": [3 adet şanslı sayı],
  "luckyColor": "Günün şanslı rengi",
  "advice": "Kısa ve akılda kalıcı bir tavsiye"
}`;

export interface HoroscopeResult {
  content: string;
  loveScore: number;
  careerScore: number;
  healthScore: number;
  luckyNumbers: number[];
  luckyColor: string;
  advice: string;
}

export async function generateDailyHoroscope(
  sign: ZodiacSign,
  date: string
): Promise<HoroscopeResult> {
  const zodiacInfo = ZODIAC_DATA[sign];

  // Tarih formatını doğrula
  const sanitizedDate = date.match(/^\d{4}-\d{2}-\d{2}$/)?.[0];
  if (!sanitizedDate) {
    throw new Error('Geçersiz tarih formatı');
  }

  const prompt = `${zodiacInfo.turkishName} burcu için ${sanitizedDate} tarihli günlük burç yorumu yaz.

Burç bilgileri:
- Element: ${zodiacInfo.element}
- Yönetici gezegen: ${zodiacInfo.ruler}
- Modalite: ${zodiacInfo.modality}
- Karakteristik özellikler: ${zodiacInfo.traits.join(', ')}

Bugünün enerjisini, aşk/kariyer/sağlık alanlarındaki etkilerini ve genel tavsiyeni paylaş.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      content: result.content || 'Yorum oluşturulamadı.',
      loveScore: Math.min(10, Math.max(1, result.loveScore || 7)),
      careerScore: Math.min(10, Math.max(1, result.careerScore || 7)),
      healthScore: Math.min(10, Math.max(1, result.healthScore || 7)),
      luckyNumbers: result.luckyNumbers || zodiacInfo.luckyNumbers,
      luckyColor: result.luckyColor || zodiacInfo.color,
      advice: result.advice || '',
    };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Yorum oluşturulurken bir hata oluştu');
  }
}

export async function generateWeeklyHoroscope(
  sign: ZodiacSign,
  weekStart: string
): Promise<HoroscopeResult> {
  const zodiacInfo = ZODIAC_DATA[sign];

  const prompt = `${zodiacInfo.turkishName} burcu için ${weekStart} haftası haftalık burç yorumu yaz.

Burç bilgileri:
- Element: ${zodiacInfo.element}
- Yönetici gezegen: ${zodiacInfo.ruler}

Bu haftanın genel enerjisini, önemli günleri ve dikkat edilmesi gereken konuları detaylı bir şekilde anlat. Haftalık yorum biraz daha uzun ve detaylı olmalı.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      content: result.content || 'Yorum oluşturulamadı.',
      loveScore: Math.min(10, Math.max(1, result.loveScore || 7)),
      careerScore: Math.min(10, Math.max(1, result.careerScore || 7)),
      healthScore: Math.min(10, Math.max(1, result.healthScore || 7)),
      luckyNumbers: result.luckyNumbers || zodiacInfo.luckyNumbers,
      luckyColor: result.luckyColor || zodiacInfo.color,
      advice: result.advice || '',
    };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Haftalık yorum oluşturulurken bir hata oluştu');
  }
}

export async function generateMonthlyHoroscope(
  sign: ZodiacSign,
  monthStart: string
): Promise<HoroscopeResult> {
  const zodiacInfo = ZODIAC_DATA[sign];

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  const date = new Date(monthStart);
  const monthName = monthNames[date.getMonth()];
  const year = date.getFullYear();

  const prompt = `${zodiacInfo.turkishName} burcu için ${monthName} ${year} aylık burç yorumu yaz.

Burç bilgileri:
- Element: ${zodiacInfo.element}
- Yönetici gezegen: ${zodiacInfo.ruler}
- Modalite: ${zodiacInfo.modality}

Bu ay için detaylı bir yorum hazırla:
- Ayın genel enerjisi ve teması
- Önemli gezegen geçişleri ve etkileri
- Aşk ve ilişkiler için öngörüler
- Kariyer ve finansal durum
- Sağlık ve enerji seviyeleri
- Ayın en şanslı günleri
- Dikkat edilmesi gereken dönemler

Yorum 300-400 kelime arasında, detaylı ve kişisel olmalı.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      content: result.content || 'Yorum oluşturulamadı.',
      loveScore: Math.min(10, Math.max(1, result.loveScore || 7)),
      careerScore: Math.min(10, Math.max(1, result.careerScore || 7)),
      healthScore: Math.min(10, Math.max(1, result.healthScore || 7)),
      luckyNumbers: result.luckyNumbers || zodiacInfo.luckyNumbers,
      luckyColor: result.luckyColor || zodiacInfo.color,
      advice: result.advice || '',
    };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Aylık yorum oluşturulurken bir hata oluştu');
  }
}

export async function generateYearlyHoroscope(
  sign: ZodiacSign,
  year: string
): Promise<HoroscopeResult> {
  const zodiacInfo = ZODIAC_DATA[sign];

  const prompt = `${zodiacInfo.turkishName} burcu için ${year} yılı yıllık burç yorumu yaz.

Burç bilgileri:
- Element: ${zodiacInfo.element}
- Yönetici gezegen: ${zodiacInfo.ruler}
- Modalite: ${zodiacInfo.modality}
- Karakteristik özellikler: ${zodiacInfo.traits.join(', ')}

Bu yıl için kapsamlı bir yorum hazırla:
- Yılın genel teması ve enerjisi
- Önemli gezegen geçişleri (Jüpiter, Satürn, tutulmalar)
- Aşk ve ilişkiler: Yılın en romantik dönemleri
- Kariyer: İş değişikliği, terfi, yeni fırsatlar
- Finans: Para kazanma ve tasarruf dönemleri
- Sağlık: Dikkat edilmesi gereken dönemler
- Kişisel gelişim fırsatları
- Yılın en şanslı ayları

Yorum 400-500 kelime arasında, kapsamlı ve ilham verici olmalı.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(completion.choices[0].message.content || '{}');

    return {
      content: result.content || 'Yorum oluşturulamadı.',
      loveScore: Math.min(10, Math.max(1, result.loveScore || 7)),
      careerScore: Math.min(10, Math.max(1, result.careerScore || 7)),
      healthScore: Math.min(10, Math.max(1, result.healthScore || 7)),
      luckyNumbers: result.luckyNumbers || zodiacInfo.luckyNumbers,
      luckyColor: result.luckyColor || zodiacInfo.color,
      advice: result.advice || '',
    };
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Yıllık yorum oluşturulurken bir hata oluştu');
  }
}

export async function generatePersonalReading(
  sign: ZodiacSign,
  question: string,
  userContext?: { ascendant?: string; moonSign?: string; birthDate?: string }
): Promise<string> {
  const zodiacInfo = ZODIAC_DATA[sign];

  // Soruyu sanitize et
  const sanitizedQuestion = sanitizeUserInput(question, 500);

  // Astroloji konusu kontrolü
  if (!isValidAstrologyQuestion(sanitizedQuestion)) {
    throw new Error('Lütfen astroloji ile ilgili bir soru sorun');
  }

  let context = `Kullanıcının güneş burcu: ${zodiacInfo.turkishName}`;
  if (userContext?.ascendant) {
    context += `\nYükselen burcu: ${userContext.ascendant}`;
  }
  if (userContext?.moonSign) {
    context += `\nAy burcu: ${userContext.moonSign}`;
  }

  const prompt = `${context}

Kullanıcının sorusu: ${sanitizedQuestion}

Bu soruya astrolojik perspektiften kişisel ve içten bir yanıt ver.`;

  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            SYSTEM_PROMPT +
            '\n\nKullanıcının kişisel sorusuna yanıt veriyorsun. Samimi ve yardımcı ol.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    return completion.choices[0].message.content || 'Yanıt oluşturulamadı.';
  } catch (error) {
    console.error('AI Error:', error);
    throw new Error('Kişisel yorum oluşturulurken bir hata oluştu');
  }
}
