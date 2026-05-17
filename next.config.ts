import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Telegram WebApp to embed in iframe
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
    ];
  },
  // Disable strict mode for Framer Motion compatibility
  reactStrictMode: false,
  // Externalize Prisma and pg to prevent Turbopack proxy errors
  serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg'],
};

export default nextConfig;
