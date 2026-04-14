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
      { source: '/mcp', destination: '/api-docs#mcp', permanent: true },
      { source: '/adr-exemption', destination: '/adr-calculator', permanent: true },
      { source: '/guides/adr-changes-2025', destination: '/adr/changes-2025', permanent: true },
      { source: '/guides/adr-tunnel-codes', destination: '/adr/tunnel-codes', permanent: true },
      { source: '/guides/adr-limited-quantities', destination: '/adr/limited-quantities', permanent: true },
      { source: '/guides/adr-training-guide', destination: '/adr/training-guide', permanent: true },
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
