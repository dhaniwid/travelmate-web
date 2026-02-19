import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicTripView from '../../../components/business/trip/PublicTripView';
import { TripResponse } from '@/types';

interface SharePageProps {
    params: Promise<{ tripId: string }>;
}

async function fetchPublicTrip(tripId: string): Promise<TripResponse | null> {
    try {
        // NEXT_PUBLIC_API_URL is e.g. "http://localhost:8889/api/v1"
        // Strip any trailing slash, then append the public trips path
        const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8889/api/v1').replace(/\/+$/, '');
        const url = `${apiBase}/public/trips/${tripId}`;

        console.log(`[SharePage] Fetching public trip: ${url}`);

        const res = await fetch(url, {
            next: { revalidate: 60 }, // cache for 60s for OG crawlers
        });

        if (!res.ok) {
            console.error(`[SharePage] API returned ${res.status} for trip ${tripId}`);
            return null;
        }

        return res.json();
    } catch (err) {
        console.error(`[SharePage] Network error fetching trip ${tripId}:`, err);
        return null;
    }
}


export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
    const { tripId } = await params;
    const data = await fetchPublicTrip(tripId);

    if (!data) {
        return {
            title: 'Trip Not Found | Miru',
            description: 'This trip could not be found.',
        };
    }

    const { trip, plan } = data;
    const destination = trip.destination || 'an Amazing Destination';
    const days = trip.trip_days || 0;
    const title = `${days > 0 ? `${days} Days in ` : ''}${destination} | Miru`;
    const description = `Check out this AI-generated travel itinerary for ${destination}, created with Miru — your intelligent trip planner.`;
    const imageUrl =
        (plan as any)?.image_url ||
        (trip as any)?.image_url ||
        'https://miru.travel/og-default.jpg';
    const pageUrl = `https://miru.travel/share/${tripId}`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: pageUrl,
            siteName: 'Miru',
            type: 'article',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: `Trip to ${destination}`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageUrl],
        },
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const { tripId } = await params;
    const data = await fetchPublicTrip(tripId);

    if (!data) {
        notFound();
    }

    return <PublicTripView data={data} />;
}
