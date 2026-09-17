import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config) => {
    return config
  },
  turbopack: {},
  async headers() {
    // 🛡️ Sentinel: Enforce security headers to prevent clickjacking (X-Frame-Options),
    // MIME-type sniffing (X-Content-Type-Options), and enforce HTTPS (HSTS).
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
  images: {
    qualities: [75, 80],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
}

export default nextConfig
