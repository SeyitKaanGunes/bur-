'use client';

import { useState } from 'react';
import { useCompatibility } from '@burcum/api-client';
import { Card, Button, ZodiacIcon, ScoreBar } from '@burcum/ui';
import { ZODIAC_SIGNS, ZODIAC_DATA, type ZodiacSign } from '@burcum/shared';

export default function CompatibilityPage() {
  const [sign1, setSign1] = useState<ZodiacSign | null>(null);
  const [sign2, setSign2] = useState<ZodiacSign | null>(null);
  const compatibility = useCompatibility();

  const handleCheck = () => {
    if (sign1 && sign2) {
      compatibility.mutate({ sign1, sign2 });
    }
  };

  const result = compatibility.data?.data;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Burç Uyumluluğu</span>
          </h1>
          <p className="text-gray-400 text-lg">
            İki burç arasındaki uyumu keşfet
          </p>
        </div>

        {/* Sign Selection */}
        <Card variant="glass" padding="lg" className="mb-8">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Sign 1 */}
            <div>
              <h3 className="text-center text-gray-400 mb-4">Birinci Burç</h3>
              <SignSelector
                selected={sign1}
                onSelect={setSign1}
                otherSelected={sign2}
              />
            </div>

            {/* Heart Icon */}
            <div className="flex justify-center">
              <div className="text-5xl animate-pulse">💕</div>
            </div>

            {/* Sign 2 */}
            <div>
              <h3 className="text-center text-gray-400 mb-4">İkinci Burç</h3>
              <SignSelector
                selected={sign2}
                onSelect={setSign2}
                otherSelected={sign1}
              />
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button
              variant="primary"
              size="lg"
              onClick={handleCheck}
              loading={compatibility.isPending}
              disabled={!sign1 || !sign2}
            >
              Uyumluluğu Hesapla
            </Button>
          </div>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Overall Score */}
            <Card variant="gradient" padding="lg">
              <div className="text-center">
                <div className="flex justify-center items-center gap-4 mb-4">
                  <ZodiacIcon sign={result.sign1} size="md" />
                  <span className="text-3xl">💕</span>
                  <ZodiacIcon sign={result.sign2} size="md" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  {ZODIAC_DATA[result.sign1]?.turkishName} & {ZODIAC_DATA[result.sign2]?.turkishName}
                </h2>
                <div className="text-6xl font-bold gradient-text mb-2">
                  %{result.overallScore}
                </div>
                <p className="text-gray-400">Genel Uyumluluk</p>
              </div>
            </Card>

            {/* Detailed Scores */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-6">Detaylı Analiz</h3>
              <div className="space-y-4">
                <ScoreBar
                  label="💕 Aşk Uyumu"
                  score={result.loveScore}
                  maxScore={100}
                  color="pink"
                />
                <ScoreBar
                  label="🤝 Arkadaşlık"
                  score={result.friendshipScore}
                  maxScore={100}
                  color="indigo"
                />
                <ScoreBar
                  label="💼 İş Ortaklığı"
                  score={result.workScore}
                  maxScore={100}
                  color="emerald"
                />
              </div>
            </Card>

            {/* Analysis */}
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-4">Yorum</h3>
              <p className="text-gray-300 leading-relaxed">{result.analysis}</p>
            </Card>

            {/* Strengths & Challenges */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card padding="lg">
                <h3 className="text-lg font-semibold mb-4 text-green-400">✓ Güçlü Yönler</h3>
                <ul className="space-y-2">
                  {result.strengths?.map((strength: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-400">•</span>
                      <span className="text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card padding="lg">
                <h3 className="text-lg font-semibold mb-4 text-amber-400">! Dikkat Edilmesi Gerekenler</h3>
                <ul className="space-y-2">
                  {result.challenges?.map((challenge: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span className="text-gray-300">{challenge}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>

            {/* Advice */}
            <Card variant="gradient" padding="lg">
              <h3 className="text-lg font-semibold mb-4">💡 Tavsiye</h3>
              <p className="text-gray-300 leading-relaxed">{result.advice}</p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function SignSelector({
  selected,
  onSelect,
  otherSelected,
}: {
  selected: ZodiacSign | null;
  onSelect: (sign: ZodiacSign) => void;
  otherSelected: ZodiacSign | null;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ZODIAC_SIGNS.map((sign) => {
        const data = ZODIAC_DATA[sign];
        const isSelected = selected === sign;

        return (
          <button
            key={sign}
            onClick={() => onSelect(sign)}
            className={`p-2 rounded-xl transition-all duration-200 ${
              isSelected
                ? 'bg-indigo-500/30 border-2 border-indigo-500 scale-110'
                : 'bg-white/5 border border-white/10 hover:bg-white/10'
            }`}
            title={data.turkishName}
          >
            <span className="text-xl">{data.symbol}</span>
          </button>
        );
      })}
    </div>
  );
}
