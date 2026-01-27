/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@burcum/shared', '@burcum/ui', '@burcum/api-client', '@burcum/astrology'],

  // Server components için external packages
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Compiler optimizasyonları
  compiler: {
    // Production'da console.log'ları kaldır
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Bundle analyzer (optional, dev için)
  // webpack: (config, { isServer }) => {
  //   if (process.env.ANALYZE === 'true') {
  //     const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  //     config.plugins.push(
  //       new BundleAnalyzerPlugin({
  //         analyzerMode: 'static',
  //         reportFilename: isServer ? '../analyze/server.html' : './analyze/client.html',
  //       })
  //     );
  //   }
  //   return config;
  // },

  // Headers cache optimization
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
    ];
  },

  // Powered by header'ı kaldır (security)
  poweredByHeader: false,

  // Compress responses
  compress: true,
};

module.exports = nextConfig;
