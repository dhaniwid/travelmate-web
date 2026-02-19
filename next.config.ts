import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.pollinations.ai',
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
        hostname: 'miru.travel',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'accounts.miru.travel',
        port: '',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    // Remove console.log in production, but keep console.error for critical debugging
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
