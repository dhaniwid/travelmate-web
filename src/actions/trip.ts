'use server';

import OpenAI from 'openai';
import postgres from 'postgres';
import { TripRequest, TripResponse, TripPlan, Activity, ItineraryItem } from '@/types';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

const sql = postgres(process.env.DATABASE_URL!);

let openaiClient: OpenAI | null = null;
function getOpenAI() {
    if (!openaiClient) {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");
        openaiClient = new OpenAI({ apiKey });
    }
    return openaiClient;
}

export async function generateTripAction(request: TripRequest & { user_id: string }): Promise<TripResponse> {
    const { destination, trip_days, style, budget, origin, user_id, start_date } = request;
    const tripId = (crypto as any).randomUUID();

    console.log(`🚀 Generating trip for ${destination} (${trip_days} days) for user ${user_id}`);

    const prompt = `
        Create a detailed ${trip_days}-day trip itinerary for ${destination}.
        Origin: ${origin}
        Context: Travelers=1, Budget=${budget > 0 ? budget : 'Moderate'}, Vibe=${style}.
        
        Return a JSON object matching this schema:
        {
          "destination": "${destination}",
          "duration": ${trip_days},
          "budget_tier": "moderate",
          "highlights": [{ "title": "string", "image_prompt": "string" }],
          "itinerary": [
            {
              "day": 1,
              "title": "Day Title",
              "activities": [
                { 
                  "time": "HH:MM", 
                  "title": "Activity Name", 
                  "description": "Captivating description", 
                  "location": "Specific Place Name", 
                  "latitude": -6.2,
                  "longitude": 106.8,
                  "category": "sightseeing|culinary|shopping|leisure",
                  "location_type": "specific|generic"
                }
              ]
            }
          ],
          "budget_breakdown": {
            "transport": 0,
            "accommodation": 0,
            "food": 0,
            "tickets": 0,
            "misc": 0
          },
          "decision_notes": ["string"],
          "arrival_guide": {
            "primary_transport": "plane|train|bus|car",
            "travel_time": "e.g. 2h 30m",
            "estimated_price_range": "e.g. $150 - $300"
          },
          "total": 0
        }

        STRICT LOCATION RULES:
        1. GENERIC ACTIVITIES (Breakfast, Lunch, Dinner, Check-in, Relax):
           - DO NOT invent a specific venue name. 
           - USE: "Breakfast around [Neighborhood]" or "Dinner at local Izakaya".
           - COORDINATES: Use the center coordinates of the neighborhood/city.
           - FLAG: "location_type": "generic"
        2. SPECIFIC ACTIVITIES (Sightseeing):
           - USE: Real specific names (e.g., "Senso-ji Temple").
           - FLAG: "location_type": "specific"
    `;

    try {
        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("AI returned empty content");

        const aiResult = JSON.parse(content);

        // Map AI Result to ItineraryItem[]
        const itinerary: ItineraryItem[] = aiResult.itinerary.map((dayPlan: any) => ({
            day: dayPlan.day,
            title: dayPlan.title,
            activities: dayPlan.activities.map((act: any) => ({
                time: act.time,
                activity: act.title,
                description: act.description,
                place_name: act.location,
                latitude: act.latitude,
                longitude: act.longitude,
                location_type: act.location_type || 'specific',
                type: act.category.charAt(0) + act.category.slice(1).toLowerCase(), // Capitalize first letter
                alternatives: []
            } as Activity))
        }));

        const plan: TripPlan = {
            trip_id: tripId,
            itinerary: itinerary,
            budget_breakdown: aiResult.budget_breakdown || {
                transport: 0,
                accommodation: 0,
                food: 0,
                tickets: 0,
                misc: 0
            },
            decision_notes: aiResult.decision_notes || [],
            arrival_guide: aiResult.arrival_guide,
            total: aiResult.total || 0,
            transport_options: [], // Initially empty
            strategic_accommodation: [], // Initially empty
            highlights: aiResult.highlights || []
        };

        const tripData = {
            id: tripId,
            user_id: user_id,
            origin: origin,
            destination: aiResult.destination || destination,
            start_date: start_date,
            trip_days: trip_days,
            style: style,
            budget: budget,
            budget_range: aiResult.budget_tier || 'moderate',
            plan_data: plan // Pass object directly to let postgres driver handle it
        };

        console.log("DEBUG: Saving Itinerary with items:", plan.itinerary?.length);

        // Save to Database
        await sql`
            INSERT INTO trips (id, user_id, origin, destination, start_date, trip_days, style, budget, budget_range, plan_data)
            VALUES (${tripData.id}, ${tripData.user_id}, ${tripData.origin}, ${tripData.destination}, ${tripData.start_date}, ${tripData.trip_days}, ${tripData.style}, ${tripData.budget}, ${tripData.budget_range}, ${tripData.plan_data as any})
        `;

        try {
            revalidatePath('/history');
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }

        return {
            trip: {
                ...tripData,
                created_at: new Date().toISOString()
            } as any,
            plan: plan,
            is_saved: false
        };

    } catch (error) {
        console.error("Trip Generation Error:", error);
        throw new Error("Failed to generate trip plan.");
    }
}

export async function addActivity(
    tripId: string,
    dayNum: number,
    index: number,
    data: { title: string, time: string, autoEnhance: boolean }
) {
    try {
        const trips = await sql`SELECT destination, plan_data FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        const planRecord = trips[0];
        const destination = planRecord.destination;
        console.log("DEBUG: Raw Plan Record Found?", !!planRecord);
        if (planRecord) {
            console.log("DEBUG: Raw Itinerary Data Type:", typeof planRecord.plan_data);
            if (typeof planRecord.plan_data === 'string') {
                console.log("DEBUG: Raw Itinerary Value (First 100 chars):", planRecord.plan_data.substring(0, 100));
            }
        }

        let plan;
        try {
            plan = typeof trips[0].plan_data === 'string' ? JSON.parse(trips[0].plan_data) : trips[0].plan_data;
        } catch (e) {
            console.error("CRITICAL: Failed to parse plan_data JSON:", e);
            throw new Error("Corrupt trip plan data");
        }

        let newActivity: Activity = {
            time: data.time,
            activity: data.title,
            description: "",
            place_name: "",
            type: "Activity",
            alternatives: []
        };

        if (data.autoEnhance) {
            console.log(`✨ AI Enhancing activity: ${data.title} in ${destination}`);
            try {
                const prompt = `
                    Context: A traveler is in ${destination}. 
                    Activity Name: ${data.title}
                    
                    Based on the activity name, generate a concise and captivating description, a specific place name (if applicable), and a category tag (choose one: sightseeing, culinary, shopping, leisure, or adventure).
                    
                    Return ONLY a JSON object:
                    {
                        "description": "string",
                        "place_name": "string",
                        "latitude": number,
                        "longitude": number,
                        "category": "string",
                        "location_type": "specific|generic"
                    }

                    STRICT LOCATION RULES:
                    1. GENERIC ACTIVITIES (Breakfast, Lunch, Dinner, Check-in, Relax):
                       - DO NOT invent specific venue names.
                       - COORDINATES: Use center coordinates of the area.
                       - FLAG: "location_type": "generic"
                    2. SPECIFIC ACTIVITIES (Sightseeing):
                       - USE real venue names.
                       - FLAG: "location_type": "specific"
                `;

                const aiResponse = await getOpenAI().chat.completions.create({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    response_format: { type: "json_object" },
                });

                const content = aiResponse.choices[0].message.content;
                if (content) {
                    const enhanced = JSON.parse(content);
                    newActivity.description = enhanced.description;
                    newActivity.place_name = enhanced.place_name;
                    newActivity.latitude = enhanced.latitude;
                    newActivity.longitude = enhanced.longitude;
                    newActivity.location_type = enhanced.location_type || 'specific';
                    newActivity.type = enhanced.category ? enhanced.category.charAt(0).toUpperCase() + enhanced.category.slice(1).toLowerCase() : "Activity";
                }
            } catch (aiError) {
                console.error("AI Enhancement failed, falling back to basic data:", aiError);
            }
        }

        // Insert into Itinerary
        const dayPlan = plan.itinerary.find((d: any) => d.day === dayNum);
        if (!dayPlan) throw new Error(`Day ${dayNum} not found in itinerary`);

        // Insert we use push or splice, it doesn't matter much as we will sort
        dayPlan.activities.push(newActivity);

        // SORT BY TIME
        dayPlan.activities.sort((a: Activity, b: Activity) => {
            // Basic HH:MM comparison
            return a.time.localeCompare(b.time);
        });

        await sql`
            UPDATE trips 
            SET plan_data = ${plan as any}
            WHERE id = ${tripId}
        `;

        try {
            revalidatePath(`/trips/${tripId}`);
        } catch (e) {
            console.warn("revalidatePath skipped (expected in non-Next environments)");
        }

        return { success: true, plan, newActivity };

    } catch (error) {
        console.error("Error adding activity:", error);
        throw new Error("Failed to add activity.");
    }
}

export async function getAddActivitySuggestions(tripId: string, dayNum: number, time: string) {
    try {
        // 1. Determine Bucket
        const hour = parseInt(time.split(':')[0]);
        let bucket = "morning";
        if (hour >= 5 && hour < 11) bucket = "morning";
        else if (hour >= 11 && hour < 15) bucket = "lunch";
        else if (hour >= 15 && hour < 18) bucket = "afternoon";
        else if (hour >= 18 && hour < 22) bucket = "dinner";
        else bucket = "night";

        const cacheKey = `day${dayNum}_${bucket}`;

        // 2. Fetch Trip & Check Cache
        const trips = await sql`SELECT destination, plan_data, suggestions_cache FROM trips WHERE id = ${tripId}`;
        if (trips.length === 0) throw new Error("Trip not found");

        const tripData = trips[0];
        const cache = tripData.suggestions_cache || {};

        if (cache[cacheKey]) {
            console.log(`🎯 Cache HIT for ${cacheKey}`);
            return cache[cacheKey];
        }

        console.log(`🔍 Cache MISS for ${cacheKey}, generating with AI...`);

        // 3. AI Generation
        const destination = tripData.destination;
        console.log("DEBUG: Raw Plan Record Found (Suggestions)?", !!tripData);
        if (tripData) {
            console.log("DEBUG: Raw Itinerary Data Type (Suggestions):", typeof tripData.plan_data);
            if (typeof tripData.plan_data === 'string') {
                console.log("DEBUG: Raw Itinerary Value (Suggestions) (First 100 chars):", tripData.plan_data.substring(0, 100));
            }
        }

        let plan;
        try {
            plan = typeof tripData.plan_data === 'string' ? JSON.parse(tripData.plan_data) : tripData.plan_data;
        } catch (e) {
            console.error("CRITICAL: Failed to parse plan_data for suggestions:", e);
            return []; // Fail gracefully for suggestions
        }
        const style = plan?.trip_style || "relaxing";

        const prompt = `
            Suggest 3 short, captivating activity titles for a traveler in ${destination} during the ${bucket} (${time}).
            The trip style is ${style}.
            
            Return ONLY a JSON object:
            {
                "suggestions": [
                    { "title": "Activity Name", "category": "sightseeing/culinary/shopping/leisure/adventure" },
                    ...
                ]
            }
        `;

        const aiResponse = await getOpenAI().chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = aiResponse.choices[0].message.content;
        if (!content) throw new Error("AI returned empty response");

        const parsedData = JSON.parse(content);
        const suggestions = parsedData.suggestions || [];

        if (!Array.isArray(suggestions)) {
            console.error("AI returned invalid format:", parsedData);
            return [];
        }

        // 4. Save to Cache - DON'T stringify, postgres driver handles objects
        const updatedCache = { ...cache, [cacheKey]: suggestions };
        await sql`
            UPDATE trips 
            SET suggestions_cache = ${updatedCache}
            WHERE id = ${tripId}
        `;

        return suggestions;

    } catch (error) {
        console.error("Error getting suggestions:", error);
        return [];
    }
}
export async function getTripAction(id: string): Promise<TripResponse | null> {
    try {
        console.log(`🔍 Fetching Trip context: ${id}`);
        const trips = await sql`SELECT * FROM trips WHERE id = ${id}`;
        if (trips.length === 0) {
            console.warn(`⚠️ Trip not found in DB: ${id}`);
            return null;
        }

        const tripData = trips[0];
        let plan = tripData.plan_data;
        if (typeof plan === 'string') {
            plan = JSON.parse(plan);
        }

        return {
            trip: {
                id: tripData.id,
                user_id: tripData.user_id,
                origin: tripData.origin,
                destination: tripData.destination,
                start_date: tripData.start_date,
                trip_days: tripData.trip_days,
                style: tripData.style,
                budget: tripData.budget,
                budget_range: tripData.budget_range,
                created_at: tripData.created_at,
                user_preferences: tripData.user_preferences
            } as any,
            plan: plan as TripPlan,
            is_saved: true
        };
    } catch (error) {
        console.error("Error fetching trip:", error);
        return null;
    }
}
