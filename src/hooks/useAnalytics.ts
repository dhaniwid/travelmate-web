'use client';

import { trackEventAction } from '@/actions/analytics';
import { useCallback } from 'react';

/**
 * Hook to handle analytics tracking from the frontend.
 * Uses the server action trackEventAction under the hood.
 */
export function useAnalytics() {
    const trackEvent = useCallback(async (eventType: string, eventData: Record<string, any> = {}) => {
        try {
            await trackEventAction(eventType, eventData);
        } catch (error) {
            // Silently fail analytics as to not disrupt UX
            console.error('Analytics capture failed:', error);
        }
    }, []);

    return { trackEvent };
}
