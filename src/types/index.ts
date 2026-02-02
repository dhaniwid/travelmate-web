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
    budget_range: string;
    created_at: string;
}

// --- ITINERARY INTERFACES ---

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

    transit_time?: string;
    transit_method?: string;
    transit_price?: number;
    alternative?: ActivityAlternative | null;
}

export interface ItineraryItem {
    day: number;
    title: string;
    morning_briefing?: MorningBriefing;
    activities: Activity[];
}

// --- NEW LOGISTICS INTERFACES ---

export interface LogisticsContext {
    distance_km: number;
    route_type: string; // NEW
    warning_alert: string;
}

export interface TransportBreakdown {
    first_mile: string; // e.g. "Taxi to Halim"
    main_leg: string;   // e.g. "Whoosh to Padalarang"
    last_mile: string;  // e.g. "Feeder to City"
}

export interface HubDetails {
    departure_node: string;
    arrival_node: string;
}

export interface TransportOption {
    strategy_tag: string;
    name: string;
    price_tier: 'LOW' | 'MED' | 'HIGH';
    total_duration_display: string; // Renamed from estimated_time
    breakdown: TransportBreakdown;
    operators_hint: string;         // NEW
    booking_query: string;          // NEW
    pros: string;
}

export interface AccommodationOption {
    type: string;
    area_name: string;             // Renamed from location_area
    recommendation_reason: string; // Renamed from location_note
    vibe: string;                  // Renamed from description
}

// --- PLAN & RESPONSE ---

export interface BudgetBreakdown {
    transport: number;
    accommodation: number;
    food: number;
    tickets: number;
    misc: number;
}

export interface TripPlan {
    trip_id: string;
    itinerary: ItineraryItem[];
    budget_breakdown: BudgetBreakdown;
    decision_notes: string[];
    total: number;

    // Logistics Section Updated
    logistics_context?: LogisticsContext;
    transport_options: TransportOption[];

    strategic_accommodation: AccommodationOption[];
}

export interface TripResponse {
    trip: Trip;
    plan: TripPlan;
    is_saved: boolean;
}

export interface PlaceHighlight {
    name: string;
    type: string;
    hook: string;
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

export interface DiscoveryResponse {
    city: string;
    tagline: string;
    vibes: string[];
    highlights: PlaceHighlight[];
    culinary_signature: CulinarySignature[];
    hidden_gem: HiddenGem;
    history_snippet: string;
}