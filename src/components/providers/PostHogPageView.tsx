'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { usePostHog } from 'posthog-js/react';

/**
 * Captures a pageview event on every client-side navigation.
 * Must be wrapped in <Suspense> because useSearchParams() requires it.
 */
function PageViewInner() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        if (pathname && posthog) {
            let url = window.location.origin + pathname;
            const queryString = searchParams?.toString();
            if (queryString) url += `?${queryString}`;

            posthog.capture('$pageview', { $current_url: url });
        }
    }, [pathname, searchParams, posthog]);

    return null;
}

export default function PostHogPageView() {
    return (
        <Suspense fallback={null}>
            <PageViewInner />
        </Suspense>
    );
}
