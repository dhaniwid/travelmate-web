// Re-export shared canonical types from @miru/types.
// Web-specific extensions (Collaborator, coordinates, discovery types) are defined below.
export type {
    Trip,
    TripPlan,
    TripResponse,
    CreateTripPayload,
    Activity,
    ActivityAlternative,
    ItineraryItem,
    MorningBriefing,
    BudgetBreakdown,
    TripHighlight,
    CulinarySignature,
    HiddenGem,
    TransportOption,
    TransportBreakdown,
    AccommodationOption,
    ArrivalGuide,
    PackingItem,
} from '@miru/types';
import type { ArrivalGuide } from '@miru/types';

// ─── Web-only types ───────────────────────────────────────────────────────────

export interface TripRequest {
    origin: string;
    destination: string;
    start_date: string;
    trip_days: number;
    style: string;
    budget: number;
}

export interface User {
    id: number;
    user_id: string;
    email: string;
    name: string;
    avatar_url?: string;
}

export interface Collaborator {
    id: string;
    trip_id: string;
    user_id: string;
    role: 'owner' | 'editor' | 'viewer';
    status: 'pending' | 'accepted' | 'declined';
    user?: User;
    invited_by?: string;
    created_at?: string;
}

export interface Essentials {
    currency: string;
    category: string;
    vibe: string;
}

export interface LogisticsData {
    arrival_guide?: ArrivalGuide;
    essentials?: Essentials;
}
