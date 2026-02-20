import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.miru.travel https://us.i.posthog.com https://js.stripe.com https://browser.sentry-cdn.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://image.pollinations.ai https://images.unsplash.com https://img.clerk.com",
      "connect-src 'self' https://clerk.miru.travel https://us.i.posthog.com https://api.amadeus.com https://o4510917712543744.ingest.de.sentry.io",
      "frame-src https://js.stripe.com",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  output: 'standalone',
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

export default withSentryConfig(nextConfig, {
  // Sentry project organization/project slugs
  org: "miru-travel",
  project: "miru-frontend",

  // Suppress verbose output during builds
  silent: !process.env.CI,

  // Upload source maps to Sentry so stack traces are readable
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements from the browser bundle
  disableLogger: true,

  // Prevents Sentry from auto-instrumenting Next.js data fetching methods to avoid
  // slowdowns on the free tier
  automaticVercelMonitors: false,
});
