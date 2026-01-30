import { api } from '@/lib/api';
import { Trip, TripRequest, TripResponse } from '@/types';

// Interface khusus untuk Payload Save Trip
// Menggabungkan metadata user dengan hasil generate AI (plan_data)
export interface SaveTripPayload {
    user_id: string;
    destination: string;
    origin: string;
    start_date: string; // Format: YYYY-MM-DD
    trip_days: number;
    style: string;
    budget_range: string;
    plan_data: any; // Bisa diganti dengan tipe TripPlan jika ingin lebih ketat
}

export const tripService = {
    // 1. Generate Trip (Legacy/Blocking)
    createTrip: async (data: TripRequest): Promise<TripResponse> => {
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

    // 4. [NEW] Save Trip
    // Kita butuh parameter 'token' karena ini endpoint terproteksi
    saveTrip: async (data: SaveTripPayload, token: string | null): Promise<{ message: string; trip_id: string }> => {
        const config = token
            ? { headers: { Authorization: `Bearer ${token}` } }
            : {};

        // Menembak endpoint /api/v1/trips/save yang baru kita buat
        const response = await api.post('/trips/save', data, config);
        return response.data;
    },

    deleteTrip: async (id: string, token: string | null, userId: string): Promise<void> => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
                'X-User-ID': userId
            }
        };
        await api.delete(`/trips/${id}`, config);
    }
};