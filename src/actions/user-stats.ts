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
 */
export async function getUserImpactStats() {
    try {
        const { userId } = await auth();
        if (!userId) return null;

        const stats = await sql`
            SELECT 
                COUNT(*)::int as total_trips,
                COALESCE(SUM(trip_days), 0)::int as total_days,
                COUNT(DISTINCT destination)::int as unique_destinations
            FROM trips
            WHERE user_id = ${userId}
        `;

        if (stats.length === 0) {
            return {
                totalTrips: 0,
                totalDays: 0,
                uniqueDestinations: 0,
                hoursSaved: 0
            };
        }

        const row = stats[0];
        return {
            totalTrips: row.total_trips,
            totalDays: row.total_days,
            uniqueDestinations: row.unique_destinations,
            hoursSaved: row.total_days * 2 // Heuristic: 2 hours saved per trip day
        };
    } catch (error) {
        console.error("Get User Impact Stats Error:", error);
        return null;
    }
}
