'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { UserPreferences } from '@/types';

const sql = postgres(process.env.DATABASE_URL!);

// Helper to parse plan_data (handles double serialization from Go backend)
function parsePlanData(planData: any) {
    if (typeof planData === 'string') {
        try {
            return JSON.parse(planData);
        } catch (e) {
            console.error("Failed to parse plan_data string:", e);
            return planData;
        }
    }
    return planData;
}

export async function updateTripPreferences(tripId: string, preferences: UserPreferences) {
    try {
        // Fetch current plan
        const trips = await sql`SELECT plan_data FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        // Clear all cached alternatives since they are now stale
        const plan = parsePlanData(trips[0].plan_data);
        if (plan && plan.itinerary) {
            plan.itinerary.forEach((day: any) => {
                day.activities.forEach((activity: any) => {
                    activity.alternatives = [];
                });
            });
        }

        await sql`
            UPDATE trips 
            SET user_preferences = ${JSON.stringify(preferences)},
                plan_data = ${JSON.stringify(plan)}
            WHERE id = ${tripId}
        `;

        try {
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating trip preferences:", error);
        throw new Error("Failed to update preferences.");
    }
}
