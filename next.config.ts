import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  webpack: (config) => {
    return config
  },
  turbopack: {},
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
