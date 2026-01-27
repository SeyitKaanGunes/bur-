import { notFound } from 'next/navigation';
import { ZODIAC_DATA, ZODIAC_SIGNS, type ZodiacSign } from '@burcum/shared';
import { HoroscopeContent } from './HoroscopeContent';

interface PageProps {
  params: { sign: string };
}

export function generateStaticParams() {
  return ZODIAC_SIGNS.map((sign) => ({ sign }));
}

export function generateMetadata({ params }: PageProps) {
  const sign = params.sign as ZodiacSign;
  if (!ZODIAC_SIGNS.includes(sign)) {
    return { title: 'Burc bulunamadı' };
  }

  const data = ZODIAC_DATA[sign];
  return {
    title: `${data.turkishName} Burcu Günlük Yorumu | Burcum`,
    description: `${data.turkishName} burcu için günlük, haftalık ve aylık burç yorumları. ${data.traits.join(', ')} özellikleriyle tanınan ${data.turkishName} burcu hakkında her şey.`,
  };
}

export default function ZodiacPage({ params }: PageProps) {
  const sign = params.sign as ZodiacSign;

  if (!ZODIAC_SIGNS.includes(sign)) {
    notFound();
  }

  const data = ZODIAC_DATA[sign];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-7xl mb-4 animate-float">{data.symbol}</div>
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          <span className="gradient-text">{data.turkishName}</span> Burcu
        </h1>
        <p className="text-gray-400">
          {data.dateRange.start.replace('-', '.')} - {data.dateRange.end.replace('-', '.')}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-12">
        <InfoCard label="Element" value={data.element} icon="🔥" />
        <InfoCard label="Gezegen" value={data.ruler} icon="🪐" />
        <InfoCard label="Şanslı Gün" value={data.luckyDay} icon="📅" />
        <InfoCard label="Renk" value={data.color} icon="🎨" />
      </div>

      {/* Traits */}
      <div className="glass rounded-2xl p-6 mb-12">
        <h2 className="text-xl font-semibold mb-4">Karakteristik Özellikler</h2>
        <div className="flex flex-wrap gap-2">
          {data.traits.map((trait) => (
            <span
              key={trait}
              className="px-4 py-2 bg-white/10 rounded-full text-sm capitalize"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Horoscope Content */}
      <HoroscopeContent sign={sign} />
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm text-gray-400">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}
