import { NextRequest, NextResponse } from 'next/server';
import { ZODIAC_SIGNS, ZODIAC_DATA, type ZodiacSign, SECURITY_HEADERS, resolveZodiacSign } from '@burcum/shared';
import { calculateCompatibility } from '@burcum/astrology';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { sign1?: string; sign2?: string };
    const { sign1, sign2 } = body;

    // Validation
    if (!sign1 || !sign2) {
      return NextResponse.json(
        { success: false, error: 'Her iki burç da gerekli' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const s1 = resolveZodiacSign(sign1);
    const s2 = resolveZodiacSign(sign2);

    if (!s1 || !s2) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz burç' },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const scores = calculateCompatibility(s1, s2);

    const data1 = ZODIAC_DATA[s1];
    const data2 = ZODIAC_DATA[s2];

    // Basit analiz oluştur
    const analysis = generateCompatibilityAnalysis(s1, s2, scores);

    const result = {
      id: `${s1}-${s2}-${Date.now()}`,
      sign1: s1,
      sign2: s2,
      sign1Name: data1.turkishName,
      sign2Name: data2.turkishName,
      ...scores,
      analysis: analysis.text,
      strengths: analysis.strengths,
      challenges: analysis.challenges,
      advice: analysis.advice,
    };

    return NextResponse.json(
      { success: true, data: result },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    console.error('Compatibility error:', error);
    return NextResponse.json(
      { success: false, error: 'Uyumluluk hesaplanırken bir hata oluştu' },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

function generateCompatibilityAnalysis(
  sign1: ZodiacSign,
  sign2: ZodiacSign,
  scores: ReturnType<typeof calculateCompatibility>
) {
  const data1 = ZODIAC_DATA[sign1];
  const data2 = ZODIAC_DATA[sign2];

  const sameElement = data1.element === data2.element;
  const isOpposite = scores.overallScore >= 70 && sign1 !== sign2;

  let text = '';
  let strengths: string[] = [];
  let challenges: string[] = [];
  let advice = '';

  if (sign1 === sign2) {
    text = `İki ${data1.turkishName} bir araya geldiğinde, birbirini mükemmel anlayan bir ikili oluşur. Aynı özellikleri paylaştığınız için güçlü bir bağ kurabilirsiniz.`;
    strengths = ['Mükemmel anlayış', 'Ortak değerler', 'Benzer iletişim tarzı'];
    challenges = ['Monotonluk riski', 'Aynı zayıflıklar', 'Rekabet olasılığı'];
    advice = 'Farklılıklarınızı keşfetmeye ve birbirinizi tamamlamaya odaklanın.';
  } else if (sameElement) {
    text = `${data1.turkishName} ve ${data2.turkishName} aynı ${data1.element} elementini paylaşır. Bu doğal bir uyum ve anlayış sağlar.`;
    strengths = ['Doğal uyum', 'Benzer enerji seviyesi', 'Kolay iletişim'];
    challenges = ['Çok benzer olabilirsiniz', 'Denge bulmak zor olabilir'];
    advice = 'Ortak enerjinizi yapıcı projelere yönlendirin.';
  } else if (isOpposite) {
    text = `${data1.turkishName} ve ${data2.turkishName} zodyakta birbirini tamamlayan burçlardır. Zıtlıklar çeker derler, bu ilişki için çok doğru!`;
    strengths = ['Güçlü çekim', 'Birbirini tamamlama', 'Dengeli ilişki'];
    challenges = ['Farklı bakış açıları', 'Zaman zaman anlaşmazlıklar'];
    advice = 'Farklılıklarınızı bir güç olarak görün, birbirinizden öğrenin.';
  } else {
    text = `${data1.turkishName} ve ${data2.turkishName} ilginç bir kombinasyon oluşturur. Her ilişki gibi bu da çaba ve anlayış gerektirir.`;
    strengths = ['Farklı perspektifler', 'Büyüme fırsatı', 'Dinamik ilişki'];
    challenges = ['Farklı ihtiyaçlar', 'İletişim çalışması gerekli'];
    advice = 'Sabırlı olun ve birbirinizin farklılıklarına saygı gösterin.';
  }

  // Skor bazlı ekleme
  if (scores.loveScore >= 8) {
    strengths.push('Güçlü romantik çekim');
  }
  if (scores.friendshipScore >= 8) {
    strengths.push('Harika arkadaşlık potansiyeli');
  }
  if (scores.workScore >= 8) {
    strengths.push('İş ortaklığı için ideal');
  }

  return { text, strengths, challenges, advice };
}
