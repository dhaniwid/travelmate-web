import { api } from '@/lib/api';

export interface FlightAlertStatus {
    id: string;
    trip_id: string;
    origin_airport: string;
    destination_airport: string;
    departure_date: string;
    return_date?: string;
    initial_price: number;
    current_price: number;
    lowest_price_seen: number;
    currency: string;
    last_checked_at?: string;
    is_active: boolean;
    created_at: string;
}

export interface FlightGuardianActivationResponse {
    status: 'active' | 'inactive' | 'error';
    current_price: number;
    currency: string;
    alert_id?: string;
}

export interface FlightAlertsResponse {
    alerts: FlightAlertStatus[];
    count: number;
}

/**
 * Activate Flight Guardian for a specific trip
 * @param tripId - The trip ID to monitor
 * @param originAirport - IATA code for origin (e.g., "CGK")
 * @param destinationAirport - IATA code for destination (e.g., "NRT")
 * @param token - Auth token
 */
export const activateFlightGuardian = async (
    tripId: string,
    originAirport: string,
    destinationAirport: string,
    token: string | null = null
): Promise<FlightGuardianActivationResponse> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post<FlightGuardianActivationResponse>(
        `/trips/${tripId}/track-flights`,
        {
            origin_airport: originAirport,
            destination_airport: destinationAirport,
        },
        config
    );
    return response.data;
};

/**
 * Get flight alert status for a trip
 * @param tripId - The trip ID
 * @param token - Auth token
 */
export const getFlightAlertStatus = async (
    tripId: string,
    token: string | null = null
): Promise<FlightAlertsResponse> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get<FlightAlertsResponse>(
        `/trips/${tripId}/alerts`,
        config
    );
    return response.data;
};

/**
 * Deactivate a specific flight alert
 * @param alertId - The alert ID to deactivate
 * @param token - Auth token
 */
export const deactivateFlightAlert = async (alertId: string, token: string | null = null): Promise<void> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    await api.delete(`/alerts/${alertId}`, config);
};

export interface Location {
    name: string;
    iata_code: string;
    city_name: string;
    type: string;
}

export interface FlightOfferDetail {
    id: string;
    price: number;
    currency: string;
    airline: string;
    duration: string;
    stops: number;
    departure_time: string;
    arrival_time: string;
}

export const searchLocations = async (keyword: string, token: string | null = null): Promise<Location[]> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get<{ locations: Location[] }>(
        `/flights/locations?keyword=${encodeURIComponent(keyword)}`,
        config
    );
    return response.data.locations;
};

export const searchFlightOffers = async (
    origin: string,
    dest: string,
    date: string,
    returnDate?: string,
    token: string | null = null
): Promise<FlightOfferDetail[]> => {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    let query = `origin=${origin}&dest=${dest}&date=${date}`;
    if (returnDate) query += `&returnDate=${returnDate}`;

    const response = await api.get<{ offers: FlightOfferDetail[] }>(
        `/flights/search?${query}`,
        config
    );
    return response.data.offers;
};
