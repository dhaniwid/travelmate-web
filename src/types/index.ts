// All core types are defined in ./trip and re-exported here.
// DiscoveryResponse and types unique to the discovery API live here.
export * from './trip';

export interface UserPreferences {
    dietary: string[];
    pace: string;
    budgetTier: 'cheap' | 'moderate' | 'luxury';
    interests: string[];
}

export interface LogisticsContext {
    distance_km: number;
    route_type: string;
    warning_alert: string;
}

export interface HubDetails {
    departure_node: string;
    arrival_node: string;
}

export interface PlaceHighlight {
    title: string;
    image_prompt: string;
    type: string;
    hook: string;
}

export interface DiscoveryResponse {
    city: string;
    tagline: string;
    vibes: string[];
    highlights: PlaceHighlight[];
    culinary_signature: CulinarySignature[];
    hidden_gem?: HiddenGem | null;
    history_snippet: string;
}