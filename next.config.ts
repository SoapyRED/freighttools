import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/api', destination: '/api-docs', permanent: true },
    ];
  },

  // TODO: freighttools.co.uk → freightutils.com 301 redirect
  // Handled at DNS level (Cloudflare) — not via Next.js redirects.
  // If domain is connected to Vercel in future, add:
  // async redirects() {
  //   return [
  //     { source: '/:path*', has: [{ type: 'host', value: 'freighttools.co.uk' }],
  //       destination: 'https://freightutils.com/:path*', permanent: true },
  //     { source: '/:path*', has: [{ type: 'host', value: 'www.freighttools.co.uk' }],
  //       destination: 'https://freightutils.com/:path*', permanent: true },
  //   ];
  // },
};

export default nextConfig;
