'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';

export type RadarNearbyItem = {
    id: string;
    name: string;
    distance_meters: number;
    category: string;
    description: string;
    has_stamp: boolean;
    slug: string;
    landmark_slug?: string;
};

export type RadarLocation = {
    area: string;
    city: string;
    province: string;
};

export type RadarData = {
    location: RadarLocation;
    nearby: RadarNearbyItem[];
    active_trip: { id: string; destination: string } | null;
};

type GeoState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

export function useRadar() {
    const { getToken, isSignedIn } = useAuth();
    const [data, setData] = useState<RadarData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [geoState, setGeoState] = useState<GeoState>('idle');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

    const fetchRadar = useCallback(async (lat: number, lng: number) => {
        setLoading(true);
        setError(null);
        try {
            const headers: Record<string, string> = {};
            if (isSignedIn) {
                const token = await getToken();
                if (token) headers['Authorization'] = `Bearer ${token}`;
            }
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/radar?lat=${lat}&lng=${lng}&radius=1000`,
                { headers }
            );
            if (!res.ok) throw new Error('Radar fetch failed');
            const json = await res.json();
            setData(json.data as RadarData);
        } catch (e) {
            setError('Gagal memuat radar. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [getToken, isSignedIn]);

    const requestLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoState('unavailable');
            return;
        }
        setGeoState('requesting');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setGeoState('granted');
                setCoords({ lat: latitude, lng: longitude });
                fetchRadar(latitude, longitude);
            },
            async () => {
                setGeoState('denied');
                // IP geolocation fallback
                try {
                    const res = await fetch('https://ipapi.co/json/');
                    if (res.ok) {
                        const ip = await res.json();
                        if (ip.latitude && ip.longitude) {
                            setCoords({ lat: ip.latitude, lng: ip.longitude });
                            fetchRadar(ip.latitude, ip.longitude);
                        }
                    }
                } catch {
                    // no fallback available
                }
            },
            { timeout: 8000, maximumAge: 60000 }
        );
    }, [fetchRadar]);

    const refresh = useCallback(() => {
        if (coords) fetchRadar(coords.lat, coords.lng);
    }, [coords, fetchRadar]);

    return { data, loading, error, geoState, requestLocation, refresh };
}
