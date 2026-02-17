/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  // Avoid next-auth vendor chunk resolution issues
  serverExternalPackages: ['next-auth'],
};

module.exports = nextConfig;
