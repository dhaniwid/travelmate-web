'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api';

export interface PassportStampData {
    id: string;
    city: string;
    city_slug: string;
    date: string;        // formatted: "FEB 13 2026"
    serial: string;
    mood: 'morning' | 'rain' | 'night';
    image_url: string;
    rotation: number;
    trip_id?: string;
}

interface APIStamp {
    id: string;
    city: string;
    city_slug: string;
    date: string;
    serial: string;
    mood: string;
    image_url: string;
    rotation: number;
    trip_id?: string;
}

function formatStampDate(isoDate: string): string {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
    }).toUpperCase().replace(',', '');
}

export function usePassportStamps() {
    const { getToken, isSignedIn } = useAuth();
    const [stamps, setStamps] = useState<PassportStampData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSignedIn) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const token = await getToken();
                const res = await api.get('/passport', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (cancelled) return;

                const raw: APIStamp[] = res.data.stamps ?? [];
                setStamps(raw.map(s => ({
                    ...s,
                    date: formatStampDate(s.date),
                    mood: s.mood as PassportStampData['mood'],
                })));
            } catch (err) {
                if (!cancelled) setError('Gagal memuat stamp koleksimu.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isSignedIn]);

    return { stamps, loading, error };
}
