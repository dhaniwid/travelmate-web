import { UserPreferences } from './index';

export interface TripRequest {
    origin: string;
    destination: string; // Empty string if auto
    start_date: string;
    trip_days: number;
    style: string;
    budget: number; // 0 if auto
}

export interface Trip {
    id: string;
    user_id: string;
    origin: string;
    destination: string;
    start_date: string;
    trip_days: number;
    style: string;
    budget: number;
    budget_range?: string;
    created_at: string;
    user_preferences?: UserPreferences;
}

export interface MorningBriefing {
    weather_forecast: string;
    outfit_tip: string;
    local_vibe: string;
}

export interface ActivityAlternative {
    activity: string;
    type: string;
    description: string;
    place_name: string;
}

export interface Activity {
    time: string;
    activity: string;
    type: string;
    description: string;
    place_name: string;
    latitude?: number;
    longitude?: number;
    coordinates?: { lat: number; lng: number };
    transit_time?: string;
    transit_method?: string;
    transit_price?: number;
    location_type?: 'specific' | 'generic'; // specific = real landmark, generic = neighborhood center
    alternative?: ActivityAlternative | null;
    alternatives?: ActivityAlternative[];
}

export interface ItineraryItem {
    day: number;
    title: string;
    morning_briefing?: MorningBriefing;
    activities: Activity[];
}

export interface ArrivalGuide {
    primary_transport: 'plane' | 'train' | 'bus' | 'car';
    travel_time: string;
    estimated_price_range: string;
}

export interface TripPlan {
    trip_id: string;
    itinerary: ItineraryItem[];
    budget_breakdown: BudgetBreakdown;
    decision_notes: string[];
    total: number;
    logistics_context?: any;
    transport_options: any[];
    strategic_accommodation: any[];
    highlights?: any[];
    arrival_guide?: ArrivalGuide;
}

export interface BudgetBreakdown {
    transport: number;
    accommodation: number;
    food: number;
    tickets: number;
    misc: number;
}

export interface TripResponse {
    trip: Trip;
    plan: TripPlan;
    is_saved: boolean;
}
