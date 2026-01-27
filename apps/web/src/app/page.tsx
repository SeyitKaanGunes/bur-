import Link from 'next/link';
import { ZODIAC_DATA, ZODIAC_SIGNS } from '@burcum/shared';
import { ZodiacCard } from '@/components/ZodiacCard';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          <span className="gradient-text">Burcum</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto mb-8">
          AI destekli kişiselleştirilmiş burç yorumlarınız. Günlük, haftalık ve aylık
          yorumlarla geleceğinize ışık tutun.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Link
            href="/kayit"
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 cosmic-glow"
          >
            Ücretsiz Başla
          </Link>
          <Link
            href="#burclar"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200"
          >
            Burcunu Seç
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <FeatureCard
          icon="✨"
          title="Kişiselleştirilmiş"
          description="Doğum haritanıza göre size özel yorumlar"
        />
        <FeatureCard
          icon="🔮"
          title="AI Destekli"
          description="Yapay zeka ile derin ve anlamlı analizler"
        />
        <FeatureCard
          icon="📅"
          title="Günlük Güncellemeler"
          description="Her gün yeni yorumlar ve öngörüler"
        />
      </section>

      {/* Zodiac Grid */}
      <section id="burclar" className="scroll-mt-8">
        <h2 className="text-3xl font-bold text-center mb-8">Burcunu Seç</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {ZODIAC_SIGNS.map((sign) => (
            <ZodiacCard key={sign} sign={sign} />
          ))}
        </div>
      </section>

      {/* Premium CTA */}
      <section className="mt-16 text-center">
        <div className="glass rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Premium ile Daha Fazlası</h2>
          <p className="text-gray-300 mb-6">
            Sınırsız okuma, kişisel AI danışman, detaylı doğum haritası analizi ve daha
            fazlası.
          </p>
          <div className="flex justify-center gap-8 mb-6">
            <div>
              <div className="text-2xl font-bold text-indigo-400">₺29.99</div>
              <div className="text-sm text-gray-400">/ ay</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">₺249.99</div>
              <div className="text-sm text-gray-400">/ yıl (2 ay hediye)</div>
            </div>
          </div>
          <Link
            href="/premium"
            className="inline-block px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
          >
            Premium'a Geç
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 text-center hover:bg-white/10 transition-all duration-200">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}
