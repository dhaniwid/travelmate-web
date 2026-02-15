'use server';

import postgres from 'postgres';
import { auth } from '@clerk/nextjs/server';

const sql = postgres(process.env.DATABASE_URL!);

/**
 * Tracks a user event in the analytics table.
 * Can be called from client components or other server actions.
 */
export async function trackEventAction(
    eventType: string,
    eventData: Record<string, any> = {},
    providedUserId?: string
) {
    try {
        let finalUserId = providedUserId;

        // If no userId provided, attempt to get it from Clerk auth
        if (!finalUserId) {
            const session = await auth();
            finalUserId = session.userId || 'anonymous';
        }

        console.log(`📊 Analytics Event: ${eventType}`, { userId: finalUserId, ...eventData });

        await sql`
            INSERT INTO user_analytics_events (
                user_id,
                event_type,
                event_data
            ) VALUES (
                ${finalUserId},
                ${eventType},
                ${JSON.stringify(eventData)}
            )
        `;

        return { success: true };
    } catch (error) {
        console.error("Track Event Error:", error);
        // We generally don't want to break the user experience if analytics fail
        return { success: false, error: "Failed to track event." };
    }
}
