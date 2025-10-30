import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This is required to allow requests from the development environment's domain.
    allowedDevOrigins: [
      'https://6000-firebase-studio-1761723615724.cluster-m7dwy2bmizezqukxkuxd55k5ka.cloudworkstations.dev',
    ],
  },
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
    ],
  },
  env: {
    VONAGE_API_KEY: process.env.VONAGE_API_KEY,
    VONAGE_SESSION_ID: process.env.VONAGE_SESSION_ID,
    VONAGE_TOKEN: process.env.VONAGE_TOKEN,
  }
};

export default nextConfig;
