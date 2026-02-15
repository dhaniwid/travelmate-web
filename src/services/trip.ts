import { api } from '@/lib/api';
// Pastikan import DiscoveryResponse ditambahkan
import { Trip, TripRequest, TripResponse, DiscoveryResponse } from '@/types';

export interface SaveTripPayload {
    user_id: string;
    destination: string;
    origin: string;
    start_date: string;
    trip_days: number;
    style: string;
    budget_range: string;
    plan_data: any;
}

export const tripService = {
    // 1. Generate Trip (Legacy/Blocking)
    createTrip: async (data: TripRequest): Promise<{ trip_id: string; message: string }> => {
        const response = await api.post('/trips', data);
        return response.data;
    },

    // 2. Get History
    getHistory: async (): Promise<{ data: Trip[] }> => {
        const response = await api.get('/trips');
        return response.data;
    },

    // 3. Get Detail
    getTripById: async (id: string): Promise<TripResponse> => {
        const response = await api.get(`/trips/${id}`);
        return response.data;
    },

    // 4. Save Trip
    saveTrip: async (data: SaveTripPayload, token: string | null): Promise<{ message: string; trip_id: string }> => {
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};

        const response = await api.post('/trips/save', data, config);
        return response.data;
    },

    deleteTrip: async (id: string, token: string | null): Promise<void> => {
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};
        await api.delete(`/trips/${id}`, config);
    },

    verifyProStatus: async (tripId: string, token: string): Promise<any> => {
        const response = await api.get(`/trips/${tripId}/export/pdf`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // 5. [NEW] Get City Discovery (Fixed for Axios)
    getCityDiscovery: async (city: string): Promise<DiscoveryResponse> => {
        const response = await api.get(`/discovery?city=${encodeURIComponent(city)}`);

        return response.data.data;
    },

    // 6. [NEW] Lazy Enrichment (M-126)
    enrichActivity: async (tripId: string, dayIndex: number, activityIndex: number): Promise<any> => {
        const response = await api.get(`/trips/${tripId}/enrich/${dayIndex}/${activityIndex}`);
        return response.data.data;
    },

    // 7. [NEW] User Preferences
    getUserPreferences: async (token: string): Promise<any> => {
        const response = await api.get('/user/preferences', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    },

    // 8. [NEW] Refine Trip (Miru Chat)
    refineTrip: async (tripId: string, instruction: string): Promise<any> => {
        const response = await api.post(`/trips/${tripId}/refine`, { instruction });
        return response.data;
    },
};