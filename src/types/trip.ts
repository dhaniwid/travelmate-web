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
    enrichment_status?: 'pending' | 'enriching' | 'completed';
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
    image_url?: string; // Enriched photo
    alternative?: ActivityAlternative | null;
    alternatives?: ActivityAlternative[];
}

export interface ItineraryItem {
    day: number;
    title: string;
    morning_briefing?: MorningBriefing;
    activities: Activity[];
}

export interface TripHighlight {
    title: string;
    type: string;
    hook: string;
    image_prompt: string;
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

// --- LOGISTICS ---

export interface TransportBreakdown {
    first_mile: string;
    main_leg: string;
    last_mile: string;
}

export interface TransportOption {
    strategy_tag: string;
    name: string;
    price_tier: 'LOW' | 'MED' | 'HIGH';
    total_duration_display: string;
    breakdown: TransportBreakdown;
    operators_hint: string;
    booking_query: string;
    pros: string;
}

export interface AccommodationOption {
    type: string;
    area_name: string;
    reason: string;
    vibe: string;
    hotel_suggestions: string[];
    photo_url?: string; // Optional if we fetch images
}

export interface PackingItem {
    category: string;
    items: string[];
}

export interface ArrivalGuide {
    primary_transport: string;
    travel_time: string;
    estimated_price_range: string;
    visa_info: string;
    best_time_visit: string;
}

export interface Essentials {
    currency: string;
    language: string;
    voltage: string;
}

export interface LogisticsData {
    arrival_guide?: ArrivalGuide;
    essentials?: Essentials;
}

export interface TripPlan {
    trip_id: string;
    itinerary: ItineraryItem[];
    budget_breakdown: BudgetBreakdown;
    decision_notes: string[];
    total?: number; // Calculated or from DB
    logistics_context?: any;
    transport_options: TransportOption[];
    strategic_accommodation: AccommodationOption[];
    arrival_guide?: ArrivalGuide;
    packing_list?: PackingItem[]; // Added
    morning_briefing?: string;
    highlights?: TripHighlight[];
    tagline?: string;
    vibes?: string[];
    culinary_signature?: CulinarySignature[];
    hidden_gem?: HiddenGem;
    history_snippet?: string;
    logistics?: LogisticsData; // NEW: M-124
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
