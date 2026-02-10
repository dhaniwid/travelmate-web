import { NextResponse } from 'next/server';
import postgres from 'postgres';
import { getActivityAlternatives, confirmActivitySwap } from '@/actions/ai-swap';

const sql = postgres(process.env.DATABASE_URL!);

// Helper to parse plan_data (handles double serialization from Go backend)
function parsePlanData(planData: any) {
    if (typeof planData === 'string') {
        try {
            return JSON.parse(planData);
        } catch (e) {
            return planData;
        }
    }
    return planData;
}

export async function GET() {
    const results: any[] = [];
    let status: "PASS" | "FAIL" = "PASS";

    try {
        // 1. SETUP: Find a valid trip and target activity
        const rawTrips = await sql`
            SELECT id, plan_data 
            FROM trips 
            ORDER BY created_at DESC 
            LIMIT 50
        `;

        let validTrip = null;
        let plan = null;

        for (const t of rawTrips) {
            const p = parsePlanData(t.plan_data);
            if (p && p.itinerary && p.itinerary.length > 0) {
                validTrip = t;
                plan = p;
                break;
            }
        }

        if (!validTrip) {
            return NextResponse.json({
                status: "FAIL",
                error: "No trips with itineraries found in database to test with."
            }, { status: 404 });
        }

        const tripId = validTrip.id;
        const dayIndex = plan.itinerary[0].day;
        const activityIndex = 0;

        // 2. CLEAR CACHE for clean test
        const cleanPlan = JSON.parse(JSON.stringify(plan));
        cleanPlan.itinerary[0].activities[activityIndex].alternatives = [];
        await sql`UPDATE trips SET plan_data = ${JSON.stringify(cleanPlan)} WHERE id = ${tripId}`;

        // TEST 1: Cold Fetch (Simulate AI Call)
        const startCold = Date.now();
        const alternatives1 = await getActivityAlternatives(tripId, dayIndex, activityIndex);
        const latencyCold = Date.now() - startCold;

        const test1Passed = Array.isArray(alternatives1) && alternatives1.length === 3;
        results.push({
            test: "Cold Start",
            status: test1Passed ? "✅" : "❌",
            latency: `${latencyCold}ms`,
            details: test1Passed ? `AI generated ${alternatives1.length} options` : "Failed to return 3 options"
        });
        if (!test1Passed) status = "FAIL";

        // TEST 2: Cache Hit (Simulate Re-open Drawer)
        const startCache = Date.now();
        const alternatives2 = await getActivityAlternatives(tripId, dayIndex, activityIndex);
        const latencyCache = Date.now() - startCache;

        const test2Passed = latencyCache < 500 && JSON.stringify(alternatives1) === JSON.stringify(alternatives2);
        results.push({
            test: "Cache Hit",
            status: test2Passed ? "✅" : "❌",
            latency: `${latencyCache}ms`,
            details: test2Passed ? "Served from DB (instant)" : `Cache fail or high latency: ${latencyCache}ms`
        });
        if (!test2Passed) status = "FAIL";

        // TEST 3: Force Refresh (Simulate "Show More")
        const alternatives3 = await getActivityAlternatives(tripId, dayIndex, activityIndex, true);
        const test3Passed = Array.isArray(alternatives3) && alternatives3.length === 3 && JSON.stringify(alternatives3) !== JSON.stringify(alternatives1);

        results.push({
            test: "Force Refresh",
            status: test3Passed ? "✅" : "❌",
            details: test3Passed ? "Cache overwritten with new data" : "Refresh yielded same data or failed"
        });
        if (!test3Passed) status = "FAIL";

        // TEST 4: Simulation of Swap
        const swapTarget = alternatives3[0];
        await confirmActivitySwap(tripId, dayIndex, activityIndex, swapTarget);

        const updatedTrips = await sql`SELECT plan_data FROM trips WHERE id = ${tripId}`;
        const updatedPlan = parsePlanData(updatedTrips[0].plan_data);
        const updatedActivity = updatedPlan.itinerary[0].activities[activityIndex];

        const test4Passed = updatedActivity.activity === swapTarget.activity;
        results.push({
            test: "Simulation of Swap",
            status: test4Passed ? "✅" : "❌",
            details: test4Passed ? `Activity successfully updated to: ${updatedActivity.activity}` : "Database update verification failed"
        });
        if (!test4Passed) status = "FAIL";

        return NextResponse.json({ status, results });

    } catch (error: any) {
        console.error("Diagnostic Error:", error);
        return NextResponse.json({
            status: "FAIL",
            error: error.message,
            results
        }, { status: 500 });
    }
}
