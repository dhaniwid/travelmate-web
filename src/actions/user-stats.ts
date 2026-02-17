'use server';

import { auth } from '@clerk/nextjs/server';

export interface UserImpactStats {
    totalTrips: number;
    totalDays: number;
    uniqueDestinations: number;
    hoursSaved: number;
    co2Saved: number;
    userLevel?: string;
}

/**
 * Fetches travel impact stats for the current user from the Go backend.
 * All calculations are performed server-side for consistency.
 */
export async function getUserImpactStats(): Promise<UserImpactStats | null> {
    try {
        const { userId, getToken } = await auth();
        if (!userId) return null;

        const token = await getToken();

        // Fetch from Go Backend Analytics API
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/impact`, {
            headers: { 'Authorization': `Bearer ${token}` },
            cache: 'no-store' // Always fetch fresh data
        });

        if (!res.ok) {
            console.error(`Backend returned ${res.status}: ${res.statusText}`);
            throw new Error("Failed to fetch impact stats from backend");
        }

        const data = await res.json();

        // Map backend response to frontend interface
        return {
            totalTrips: data.total_trips || 0,
            totalDays: data.total_days || 0,
            uniqueDestinations: data.unique_destinations || 0,
            hoursSaved: data.hours_saved || 0,
            co2Saved: data.co2_saved || 0,
            userLevel: data.user_level || 'Explorer'
        };
    } catch (error) {
        console.error("Get User Impact Stats Error:", error);
        return null; // UI will handle null gracefully
    }
}
