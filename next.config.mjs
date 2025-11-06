/** @type {import('next').NextConfig} */

import createPwa from 'next-pwa';

const withPWA = createPwa({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  serverActions: {
    allowedOrigins: ['localhost:9002', '*.google.com'],
  },
  env: {
    NEXT_PUBLIC_VIDEOSDK_TOKEN: process.env.NEXT_PUBLIC_VIDEOSDK_TOKEN,
    NEXT_PUBLIC_VIDEOSDK_API_KEY: process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY,
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY,
  }
};

export default withPWA(nextConfig);
