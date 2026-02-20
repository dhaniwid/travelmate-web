// sentry.server.config.ts
// Sentry SDK initialization for the Node.js runtime (Server Components, API Routes)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://6350c599ad1bd70964ba9818cc6fb57d@o4510917712543744.ingest.de.sentry.io/4510917722636368",

    tracesSampleRate: 1.0,

    // Only transmit errors in production
    enabled: process.env.NODE_ENV === "production",
});
