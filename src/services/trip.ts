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
    createTrip: async (data: TripRequest, token: string | null = null): Promise<{ trip_id: string; message: string }> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post('/trips', data, config);
        return response.data;
    },

    // 2. Get History (Requires Auth)
    getHistory: async (token: string | null = null): Promise<{ data: Trip[] }> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get('/trips', config);
        return response.data;
    },

    // 3. Get Detail
    getTripById: async (id: string, token: string | null = null): Promise<TripResponse> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        try {
            const response = await api.get(`/trips/${id}`, config);
            return response.data;
        } catch (error: any) {
            console.error(`Error fetching trip ${id}:`, error.response?.status);
            throw error;
        }
    },

    // 4. Save Trip
    saveTrip: async (data: SaveTripPayload, token: string | null): Promise<{ message: string; trip_id: string }> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post('/trips/save', data, config);
        return response.data;
    },

    deleteTrip: async (id: string, token: string | null): Promise<void> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
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
    enrichActivity: async (tripId: string, dayIndex: number, activityIndex: number, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/trips/${tripId}/enrich/${dayIndex}/${activityIndex}`, config);
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
    refineTrip: async (tripId: string, instruction: string, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/trips/${tripId}/refine`, { instruction }, config);
        return response.data;
    },

    // 9. [NEW] Activity Replacement (M-128)
    getActivityAlternativesByIndex: async (tripId: string, dayIndex: number, activityIndex: number, token: string | null = null, force: boolean = false): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const url = `/trips/${tripId}/alternatives/${dayIndex}/${activityIndex}${force ? '?refresh=true' : ''}`;
        const response = await api.get(url, config);
        return response.data.data;
    },

    swapActivity: async (tripId: string, dayIndex: number, activityIndex: number, alternative: any, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/trips/${tripId}/swap/${dayIndex}/${activityIndex}`, { alternative }, config);
        return response.data;
    },

    addActivity: async (tripId: string, dayIndex: number, title: string, time: string, autoEnhance: boolean, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post(`/trips/${tripId}/activities`, {
            day_index: dayIndex,
            title,
            time,
            auto_enhance: autoEnhance
        }, config);
        return response.data;
    },

    getAddActivitySuggestions: async (tripId: string, dayIndex: number, time: string, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/trips/${tripId}/suggestions/${dayIndex}?time=${encodeURIComponent(time)}`, config);
        const data = response.data.data;

        // Map backend ActivityAlternative format to frontend expectation if needed
        // Backend: { activity: string, type: string }
        // Frontend expects: { title: string, category: string } in some places
        return data.map((s: any) => ({
            title: s.activity,
            category: s.type
        }));
    },

    deleteActivity: async (tripId: string, dayIndex: number, activityIndex: number, token: string | null = null): Promise<any> => {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.delete(`/trips/${tripId}/activities/${dayIndex}/${activityIndex}`, config);
        return response.data;
    },
};