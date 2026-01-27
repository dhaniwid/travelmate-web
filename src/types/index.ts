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
    origin: string;
    destination: string;
    start_date: string;
    trip_days: number;
    style: string;
    budget: number;
    budget_range: string;
    created_at: string;
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

    transit_time?: string;   // e.g. "15 min"
    transit_method?: string; // e.g. "Walk"
    transit_price?: number;  // e.g. 15000
    alternative?: ActivityAlternative | null; // Shadow Option
}

export interface ItineraryItem {
    day: number;
    title: string;
    morning_briefing?: MorningBriefing;
    activities: Activity[];
}

export interface TransportOption {
    type: string;
    name: string;
    price: number;
    estimated_time: string;
    pros: string;
}

export interface AccommodationOption {
    name: string;
    type: string;
    rating: string;
    price_per_night: number;
    location_area: string;
    description: string;
    image_url?: string;
}

export interface TripPlan {
    trip_id: string;
    itinerary: ItineraryItem[];
    budget_breakdown: BudgetBreakdown;
    transport_options: TransportOption[];
    accommodation_options: AccommodationOption[];
    decision_notes: string[];
}

export interface TripResponse {
    trip: Trip;
    plan: TripPlan;
}

export interface BudgetBreakdown {
    transport: number;
    accommodation: number;
    food: number;
    tickets: number;
    misc: number;
}