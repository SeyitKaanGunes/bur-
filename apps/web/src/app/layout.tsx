import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';

// Stars component'ı lazy load (performans için)
const Stars = dynamic(() => import('@/components/Stars'), {
  ssr: false,
  loading: () => null,
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Burcum - Kişisel Burç Yorumların',
  description:
    'AI destekli kişiselleştirilmiş günlük, haftalık ve aylık burç yorumları. Doğum haritası analizi ve burç uyumluluk testi.',
  keywords: [
    'burç',
    'burç yorumu',
    'günlük burç',
    'haftalık burç',
    'doğum haritası',
    'astroloji',
    'zodyak',
    'burç uyumu',
  ],
  authors: [{ name: 'Burcum' }],
  openGraph: {
    title: 'Burcum - Kişisel Burç Yorumların',
    description: 'AI destekli kişiselleştirilmiş burç yorumları',
    url: 'https://burcum.site',
    siteName: 'Burcum',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Burcum - Kişisel Burç Yorumların',
    description: 'AI destekli kişiselleştirilmiş burç yorumları',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <Stars />
          <Header />
          <main className="relative z-10 min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
