import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer info
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable unused browser features
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // XSS protection (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  // Basic CSP — allows Clerk, PostHog, Stripe iframes, and self
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // script-src: allow Clerk (prod + dev), PostHog (both subdomains), Stripe
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.miru.travel https://*.clerk.accounts.dev https://us.i.posthog.com https://us-assets.i.posthog.com https://js.stripe.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://image.pollinations.ai https://images.unsplash.com https://img.clerk.com",
      "connect-src 'self' http://localhost:8889 http://localhost:8080 https://clerk.miru.travel https://*.clerk.accounts.dev https://clerk-telemetry.com https://us.i.posthog.com https://us-assets.i.posthog.com https://api.amadeus.com https://api.unsplash.com https://travelmate-mvp-production.up.railway.app",

      "frame-src https://js.stripe.com",
    ].join('; '),
  },

];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
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
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
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
