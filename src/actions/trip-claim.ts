'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.DATABASE_URL!);

export async function claimTripAction(tripId: string, userId: string) {
    try {
        console.log(`🛡️ Claiming trip ${tripId} for user ${userId}`);

        // Update the trip's user_id
        const result = await sql`
            UPDATE trips 
            SET user_id = ${userId}
            WHERE id = ${tripId} AND (user_id IS NULL OR user_id = '')
            RETURNING id
        `;

        if (result.length === 0) {
            console.warn(`⚠️ Trip ${tripId} not found or already claimed.`);
            return { success: false, message: "Trip not found or already claimed." };
        }

        revalidatePath(`/trips/${tripId}`);
        revalidatePath('/history');
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error("Claim Trip Error:", error);
        return { success: false, error: "Failed to claim trip." };
    }
}
