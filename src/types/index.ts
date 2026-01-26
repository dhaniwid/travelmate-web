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

export interface Activity {
    time: string;
    activity: string;
    type: string;
    description: string;
    place_name: string;
    latitude: number | null;
    longitude: number | null;
}

export interface ItineraryItem {
    day: number;
    title: string;
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