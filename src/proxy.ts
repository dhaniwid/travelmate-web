import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/pricing(.*)',
    '/trips(.*)',
    '/explore(.*)',       // Destination discovery — zero auth wall
    '/share(.*)',         // Public read-only trip share page (no auth required)
    '/api/webhooks(.*)',
    '/api/v1/(.*)',       // Allow all public access to API to ensure server-actions aren't blocked by Clerk context proxying
    '/api/diagnostics(.*)', // Allow public API connection diagnostics
    '/api/admin(.*)',      // Admin proxy — guarded by Clerk session + email allowlist in route handler
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();
    const isRoot = req.nextUrl.pathname === '/';

    if (isRoot && userId) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

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
