import { auth } from '@clerk/nextjs/server';
import TripResult from '@/components/business/TripResult';
import ChatFab from '@/components/layout/ChatFab';
import TravelModeView from '@/components/trip/TravelModeView';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import ItinerarySkeleton from '@/components/business/ItinerarySkeleton';
import { TripResponse } from '@/types';

interface TripPageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{ mode?: string }>;
}

export const dynamic = 'force-dynamic';

async function fetchTrip(id: string, token: string | null): Promise<TripResponse | null> {
    try {
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1').replace(/\/+$/, '');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${apiBase}/trips/${id}`, { headers, cache: 'no-store' });
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Go API returned ${res.status}`);

        const json = await res.json();
        return (json.data ?? json) as TripResponse;
    } catch (err) {
        console.error(`[TripPage] Failed to fetch trip ${id}:`, err);
        return null;
    }
}

export default async function TripPage({ params, searchParams }: TripPageProps) {
    const { id } = await params;
    const { mode } = await searchParams;
    const { getToken } = await auth();
    const token = await getToken();
    const data = await fetchTrip(id, token);

    if (!data) {
        notFound();
    }

    const isTravelMode = mode === 'travel' || data.trip.travel_mode_active === true;

    if (isTravelMode) {
        return <TravelModeView data={data} />;
    }

    return (
        <main className="min-h-screen bg-[#060F1E] relative">

            <Suspense fallback={<ItinerarySkeleton />}>
                <TripResult data={data} isSavedView={true} />
            </Suspense>

            {/* Miru Chat FAB 💬 */}
            <ChatFab tripId={id} />
        </main>
    );
}