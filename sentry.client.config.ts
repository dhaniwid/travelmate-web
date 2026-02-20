// sentry.client.config.ts
// Sentry SDK initialization for the browser (Client Components)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://6350c599ad1bd70964ba9818cc6fb57d@o4510917712543744.ingest.de.sentry.io/4510917722636368",

    // Capture 100% of transactions in production — lower to 0.1 after launch
    tracesSampleRate: 1.0,

    // Only transmit errors in production
    enabled: process.env.NODE_ENV === "production",

    // Attach user context automatically from Clerk (set in _app or layout if needed)
    integrations: [
        Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
        }),
    ],

    // Session replay sample rates
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
});
