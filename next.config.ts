import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // 🔥 THIS IS THE FIX

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true, // 🔴 static export-এর জন্য MUST
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
