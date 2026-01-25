import { api } from '@/lib/api';
import { Trip, TripRequest, TripResponse } from '@/types';

export const tripService = {
    createTrip: async (data: TripRequest): Promise<TripResponse> => {
        const response = await api.post('/trips', data);
        return response.data;
    },

    getHistory: async (): Promise<{ data: Trip[] }> => {
        const response = await api.get('/trips');
        return response.data;
    },

    getTripById: async (id: string): Promise<TripResponse> => {
        const response = await api.get(`/trips/${id}`);
        return response.data;
    }
};