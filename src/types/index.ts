export * from './trip';

export interface UserPreferences {
    dietary: string[];
    pace: string;
    budgetTier: 'cheap' | 'moderate' | 'luxury';
    interests: string[];
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
    total_duration_display: string;
    breakdown: TransportBreakdown;
    operators_hint: string;
    booking_query: string;
    pros: string;
    cons: string; // Add cons
    // Fields expected by TransportCard
    description?: string;
    price?: number;
    estimated_time?: string;
    type?: string;
}

export interface AccommodationOption {
    type: string;
    area_name: string;             // Renamed from location_area
    recommendation_reason: string; // Renamed from location_note
    vibe: string;                  // Renamed from description
    name: string; // Add name
}

export interface PlaceHighlight {
    title: string;
    image_prompt: string;
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