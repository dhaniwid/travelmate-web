import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing(.*)',
    '/trips(.*)',
    '/share(.*)',         // Public read-only trip share page (no auth required)
    '/api/webhooks(.*)',
    '/api/v1/(.*)',       // Allow all public access to API to ensure server-actions aren't blocked by Clerk context proxying
    '/api/diagnostics(.*)' // Allow public API connection diagnostics
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files (folders/files with dots)
        '/((?!.*\\..*|_next).*)',
        // Always run for root
        '/',
        // Always run for API and trpc routes
        '/(api|trpc)(.*)',
    ],
};
