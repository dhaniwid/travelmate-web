'use server';

import postgres from 'postgres';
import { auth } from '@clerk/nextjs/server';

const sql = postgres(process.env.DATABASE_URL!);

export interface UserImpactStats {
    totalTrips: number;
    totalDays: number;
    uniqueDestinations: number;
    hoursSaved: number;
}

/**
 * Calculates travel impact stats for the current user.
 * Now fetches from the Go backend to ensure consistency with analytics events.
 */
export async function getUserImpactStats() {
    try {
        const { userId, getToken } = await auth();
        if (!userId) return null;

        const token = await getToken();

        // Fetch from Go Backend Analytics
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/impact`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch impact stats from backend");

        const backendStats = await res.json();

        // Also get some data from trips table for unique destinations (as events might be transient)
        const tripData = await sql`
            SELECT 
                COALESCE(SUM(trip_days), 0)::int as total_days,
                COUNT(DISTINCT destination)::int as unique_destinations
            FROM trips
            WHERE user_id = ${userId}
        `;

        const row = tripData[0];
        const totalTrips = backendStats.total_trips || 0;
        const totalDays = row.total_days;

        return {
            totalTrips: totalTrips,
            totalDays: totalDays,
            uniqueDestinations: row.unique_destinations,
            hoursSaved: totalDays * 2, // 2 hours saved per trip day
            co2Saved: (totalTrips * 12.5).toFixed(1) // Mock: 12.5kg CO2 saved per AI optimization
        };
    } catch (error) {
        console.error("Get User Impact Stats Error:", error);
        return null; // Fallback to mocks handled by UI
    }
}
