'use client';

import Link from 'next/link';
import { ZODIAC_DATA, type ZodiacSign } from '@burcum/shared';

interface ZodiacCardProps {
  sign: ZodiacSign;
}

export function ZodiacCard({ sign }: ZodiacCardProps) {
  const data = ZODIAC_DATA[sign];

  return (
    <Link
      href={`/burc/${sign}`}
      className="glass rounded-2xl p-4 text-center hover:bg-white/10 hover:scale-105 transition-all duration-200 group"
    >
      <div className="text-4xl mb-2 group-hover:animate-float">{data.symbol}</div>
      <div className="font-semibold">{data.turkishName}</div>
      <div className="text-xs text-gray-400 mt-1">
        {data.dateRange.start.replace('-', '.')} - {data.dateRange.end.replace('-', '.')}
      </div>
    </Link>
  );
}
