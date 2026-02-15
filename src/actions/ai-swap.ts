'use server';

import OpenAI from 'openai';
import postgres from 'postgres';
import { revalidatePath } from 'next/cache';
import { ActivityAlternative } from '@/types';

// 1. Initialize DB Client
const sql = postgres(process.env.DATABASE_URL!);

// 2. Helper to get OpenAI Client (Lazy Init)
let openaiClient: OpenAI | null = null;
function getOpenAI() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY is not set in environment variables.");
        }
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

// 3. Helper to parse plan_data (handles double serialization)
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

/**
 * AI Logic: Suggest 3 context-aware alternatives with Smart Caching
 */
export async function getActivityAlternatives(
    tripId: string,
    day: number,
    activityIndex: number,
    forceRefresh: boolean = false
): Promise<ActivityAlternative[]> {
    try {
        // 1. Fetch current trip data from DB
        const trips = await sql`SELECT destination, start_date, plan_data, user_preferences FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        const { destination, start_date, plan_data: raw_plan_data, user_preferences } = trips[0];
        const plan_data = parsePlanData(raw_plan_data);
        const prefs = user_preferences || {};

        const dayPlan = plan_data.itinerary.find((d: any) => d.day === day);
        if (!dayPlan) throw new Error(`Day ${day} not found`);

        const activity = dayPlan.activities[activityIndex];
        if (!activity) throw new Error(`Activity index ${activityIndex} not found`);

        // 2. Check Cache
        if (activity.alternatives && activity.alternatives.length > 0 && !forceRefresh) {
            console.log("Returning cached alternatives for activity:", activity.activity);
            return activity.alternatives;
        }

        // 3. Fetch from AI if no cache or forceRefresh
        console.log(`Fetching AI alternatives for: ${activity.activity} (forceRefresh: ${forceRefresh})`);

        const preferenceContext = `
            USER PREFERENCES:
            - Dietary: ${prefs.dietary?.join(', ') || 'No specific restrictions'}
            - Pace: ${prefs.pace || 'Balanced'}
            - Budget: ${prefs.budgetTier || 'Moderate'}
            - Interests: ${prefs.interests?.join(', ') || 'Exploration'}
        `.trim();

        const prompt = `
            You are a local travel expert. The user is in ${destination} on ${start_date} (Day ${day}).
            
            ${preferenceContext}
            
            Current plan at ${activity.time}: ${activity.activity} (${activity.description} at ${activity.place_name}).
            The user wants to replace this.
            
            Suggest 3 ALTERNATIVE activities that:
            1. STRICTLY follow the User Preferences listed above (especially dietary and budget).
            2. Are geographically close to ${activity.place_name}.
            3. Fit the time slot ${activity.time}.
            4. Are distinct from the original.
            
            Return exactly this JSON object structure: 
            { "activities": [{ "activity": "Name", "description": "Short captivating description", "type": "Culinary|Sightseeing|Culture|Leisure", "place_name": "Specific Location" }] }
        `;

        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("AI returned empty content");

        const data = JSON.parse(content);
        const alternatives: ActivityAlternative[] = data.activities || data.alternatives || (Array.isArray(data) ? data : Object.values(data)[0]);

        const slicedAlternatives = alternatives.slice(0, 3);

        // 4. Save to DB (Cache it)
        activity.alternatives = slicedAlternatives;

        await sql`
            UPDATE trips 
            SET plan_data = ${JSON.stringify(plan_data)} 
            WHERE id = ${tripId}
        `;

        // 5. Revalidate Path to ensure UI reflects the new cache
        try {
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }

        return slicedAlternatives;
    } catch (error) {
        console.error("AI Swap Error:", error);
        throw new Error("Failed to generate alternatives. Please try again.");
    }
}

/**
 * DB Logic: Perist the change to Postgres
 */
export async function confirmActivitySwap(
    tripId: string,
    day: number,
    activityIndex: number,
    newActivityData: ActivityAlternative
) {
    try {
        const trips = await sql`SELECT plan_data, ai_edits_used FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        const plan = parsePlanData(trips[0].plan_data);
        const ai_edits_used = (trips[0].ai_edits_used || 0) + 1; // Increment

        const dayPlan = plan.itinerary.find((d: any) => d.day === day);
        if (!dayPlan) throw new Error(`Day ${day} not found`);

        const oldActivity = dayPlan.activities[activityIndex];
        if (!oldActivity) throw new Error(`Activity index ${activityIndex} not found`);

        const updatedActivity = {
            ...oldActivity,
            activity: newActivityData.activity,
            description: newActivityData.description,
            type: newActivityData.type,
            place_name: newActivityData.place_name,
            latitude: null,
            longitude: null,
            alternatives: []
        };

        dayPlan.activities[activityIndex] = updatedActivity;

        await sql`
            UPDATE trips 
            SET plan_data = ${JSON.stringify(plan)},
                ai_edits_used = ${ai_edits_used}
            WHERE id = ${tripId}
        `;

        try {
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }
        return { success: true };
    } catch (error) {
        console.error("DB Swap Error:", error);
        throw new Error("Failed to save changes to database.");
    }
}

/**
 * Remove an activity from the itinerary
 */
export async function deleteActivity(tripId: string, day: number, activityIndex: number) {
    try {
        const trips = await sql`SELECT plan_data, ai_edits_used FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        const plan = parsePlanData(trips[0].plan_data);
        const dayPlan = plan.itinerary.find((d: any) => d.day === day);
        if (!dayPlan) throw new Error(`Day ${day} not found`);

        // Remove the activity
        dayPlan.activities.splice(activityIndex, 1);

        await sql`
            UPDATE trips 
            SET plan_data = ${JSON.stringify(plan)} 
            WHERE id = ${tripId}
        `;

        try {
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }
        return { success: true };
    } catch (error) {
        console.error("Delete Activity Error:", error);
        throw new Error("Failed to delete activity.");
    }
}
