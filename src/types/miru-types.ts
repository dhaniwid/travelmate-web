/**
 * @miru/types — Canonical shared TypeScript types for Miru web and mobile.
 *
 * These are the types that both travelmate-web and travelmate-mobile agree on.
 * Platform-specific extensions (web: Collaborator, coordinates, etc.)
 * remain in each project's own types/ directory.
 *
 * Import: import type { Trip, TripPlan, TripResponse } from '@miru/types';
 */

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Trip {
    id: string;
    user_id?: string;
    origin: string;
    destination: string;
    start_date?: string;
    trip_days: number;
    style: string;
    budget?: number;
    budget_range?: string;
    created_at?: string;
    itinerary_status?: 'pending' | 'generating' | 'completed';
    enrichment_status?: 'pending' | 'enriching' | 'completed';
    travel_mode_active?: boolean;
}

// ─── Plan Components ──────────────────────────────────────────────────────────

export interface ActivityAlternative {
    activity: string;
    type: string;
    description: string;
    place_name: string;
}

export interface Activity {
    time: string;
    activity: string;
    type?: string;
    description: string;
    place_name: string;
    description_short?: string;
    image_url?: string;
    transit_time?: string;
    transit_method?: string;
    transit_price?: number;
    is_skeleton?: boolean;
    is_hidden_gem?: boolean;
    alternatives?: ActivityAlternative[];
    // Enrichment fields
    latitude?: number | null;
    longitude?: number | null;
    address?: string;
}

export interface MorningBriefing {
    weather_forecast: string;
    outfit_tip: string;
    local_vibe: string;
}

export interface ItineraryItem {
    day: number;
    title: string;
    morning_briefing?: MorningBriefing;
    activities: Activity[];
}

export interface BudgetBreakdown {
    transport: number;
    accommodation: number;
    food: number;
    tickets: number;
    misc: number;
}

export interface CulinarySignature {
    name: string;
    description: string;
    tip: string;
}

export interface HiddenGem {
    name: string;
    description: string;
}

export interface TripHighlight {
    title: string;
    type: string;
    hook: string;
    image_prompt?: string;
    image_url?: string; // fetched client-side via Unsplash
}

// ─── Logistics ────────────────────────────────────────────────────────────────

export interface TransportBreakdown {
    first_mile: string;
    main_leg: string;
    last_mile: string;
}

export interface TransportOption {
    type?: 'flight' | 'train' | 'bus' | 'car'; // transport mode — used for progressive disclosure
    strategy_tag: string;
    name: string;
    price_tier: 'LOW' | 'MED' | 'HIGH';
    total_duration_display: string;
    breakdown: TransportBreakdown;
    operators_hint?: string;
    booking_query?: string;
    pros: string;
}

export interface AccommodationOption {
    type: string;
    area_name: string;
    reason: string;
    vibe: string;
    hotel_suggestions?: string[];
}

export interface ArrivalGuide {
    primary_transport: string;
    travel_time: string;
    estimated_price_range: string;
    visa_info?: string;
    best_time_visit?: string;
}

export interface PackingItem {
    category: string;
    items: string[];
}

// ─── Trip Plan ────────────────────────────────────────────────────────────────

export interface TripPlan {
    trip_id?: string;
    itinerary: ItineraryItem[];
    budget_breakdown?: BudgetBreakdown;
    decision_notes?: string[];
    tagline?: string;
    vibes?: string[];
    highlights?: TripHighlight[];
    morning_briefing?: string;
    culinary_signature?: CulinarySignature[];
    hidden_gem?: HiddenGem;
    history_snippet?: string;
    destination_airport?: string;
    transport_options?: TransportOption[];
    strategic_accommodation?: AccommodationOption[];
    arrival_guide?: ArrivalGuide;
    packing_list?: PackingItem[];
}

// ─── API Shapes ───────────────────────────────────────────────────────────────

export interface TripResponse {
    trip: Trip;
    plan: TripPlan;
    is_saved?: boolean;
}

export interface CreateTripPayload {
    user_id: string;
    destination: string;
    style: string;
    trip_days: number;
    origin: string;
    budget: number;
    start_date?: string;
}
