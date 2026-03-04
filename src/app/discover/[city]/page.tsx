import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Insight {
    name: string;
    category: string;
    description: string;
    city: string;
}

interface DiscoverPageProps {
    params: Promise<{ city: string }>;
}

// ─── Category → display config ────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { emoji: string; label: string }> = {
    food: { emoji: '🍜', label: 'Food & Drink' },
    restaurant: { emoji: '🍽️', label: 'Restaurant' },
    culture: { emoji: '🏛️', label: 'Culture' },
    nature: { emoji: '🌿', label: 'Nature' },
    attraction: { emoji: '🗺️', label: 'Attraction' },
    accommodation: { emoji: '🏨', label: 'Stay' },
    transport: { emoji: '🚄', label: 'Transport' },
    hidden_gem: { emoji: '💎', label: 'Hidden Gem' },
};

function getCategoryConfig(category: string): { emoji: string; label: string } {
    const key = category?.toLowerCase() ?? '';
    const match = Object.entries(CATEGORY_CONFIG).find(([k]) => key.includes(k));
    return match?.[1] ?? { emoji: '✦', label: category || 'Local' };
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getInsights(city: string): Promise<Insight[]> {
    try {
        const apiBase = (
            process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8889/api/v1'
        ).replace(/\/+$/, '');

        const res = await fetch(`${apiBase}/destinations/${encodeURIComponent(city)}/insights`, {
            next: { revalidate: 3600 }, // Cache 1 hour — knowledge data is stable
        });

        if (!res.ok) return [];
        const data = (await res.json()) as { insights: Insight[] };
        return data.insights ?? [];
    } catch {
        return [];
    }
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata(
    { params }: DiscoverPageProps
): Promise<Metadata> {
    const { city } = await params;
    const decodedCity = decodeURIComponent(city);
    const displayCity = decodedCity.replace(/-/g, ' ');

    return {
        title: `Discover ${displayCity} — Local Secrets & Hidden Gems | Miru`,
        description: `Curated local insights for ${displayCity}: best food spots, cultural gems, nature hideaways and hidden secrets. Plan your trip with Miru.`,
        openGraph: {
            title: `${displayCity} — Local Secrets`,
            description: `Discover what locals love in ${displayCity}.`,
            images: [
                {
                    url: `https://source.unsplash.com/1200x630/?${encodeURIComponent(displayCity)},travel`,
                    width: 1200,
                    height: 630,
                    alt: displayCity,
                },
            ],
        },
    };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DiscoverCityPage({ params }: DiscoverPageProps) {
    const { city } = await params;
    const decodedCity = decodeURIComponent(city);
    const displayCity = decodedCity.replace(/-/g, ' ');
    const displayCityTitle = displayCity
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');

    const insights = await getInsights(decodedCity);

    // Unsplash photo URL (deterministic, no API key required for source.unsplash.com)
    const heroImageUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(displayCity)},city,travel`;

    return (
        <main className="min-h-screen bg-[#F5F1E8]">

            {/* ── Hero Section ─────────────────────────────────────────── */}
            <section className="relative h-[30vh] min-h-[220px] max-h-[340px] overflow-hidden">
                {/* Background image */}
                <Image
                    src={heroImageUrl}
                    alt={`${displayCityTitle} travel photo`}
                    fill
                    priority
                    className="object-cover object-center"
                    unoptimized // source.unsplash.com returns redirects; skip Next.js optimisation
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />

                {/* Breadcrumb */}
                <div className="absolute top-4 left-4">
                    <Link
                        href="/dashboard"
                        className="text-white/70 hover:text-white text-xs font-medium uppercase tracking-widest transition-colors"
                    >
                        ← Miru
                    </Link>
                </div>

                {/* City name */}
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-4 text-center">
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] mb-2">
                        Local Secrets
                    </p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white uppercase drop-shadow-lg">
                        {displayCityTitle}
                    </h1>
                </div>
            </section>

            {/* ── Content Section ──────────────────────────────────────── */}
            <section className="px-4 py-8 mx-auto max-w-3xl">

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-gray-500">
                        ✦ Explore Local Secrets
                    </p>
                    {insights.length > 0 && (
                        <span className="text-[11px] text-gray-400 font-medium">
                            {insights.length} place{insights.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                {/* ── Grid ─────────────────────────────────────────────── */}
                {insights.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {insights.map((insight, i) => {
                                const config = getCategoryConfig(insight.category);
                                return (
                                    <article
                                        key={i}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
                                    >
                                        {/* Category badge */}
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="text-lg leading-none"
                                                role="img"
                                                aria-label={config.label}
                                            >
                                                {config.emoji}
                                            </span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                {config.label}
                                            </span>
                                        </div>

                                        {/* Title */}
                                        <h2 className="font-semibold text-gray-900 text-base leading-snug line-clamp-2">
                                            {insight.name}
                                        </h2>

                                        {/* Metadata (city) */}
                                        <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                            <span role="img" aria-label="location">📍</span>
                                            {insight.city}
                                        </p>

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                            {insight.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>

                        {/* ── CTA — placed after the grid ──────────────── */}
                        <div className="mt-8">
                            <Link
                                href={`/dashboard?destination=${encodeURIComponent(displayCityTitle)}`}
                                className="w-full bg-gray-900 text-white py-4 rounded-xl font-medium tracking-wide flex justify-center items-center gap-2 hover:bg-gray-800 active:bg-gray-950 transition-colors duration-150"
                            >
                                <span>PLAN THIS VIBE</span>
                                <span>→</span>
                            </Link>
                            <p className="text-center text-[11px] text-gray-400 mt-3">
                                AI-generated day-by-day itinerary in 30 seconds
                            </p>
                        </div>
                    </>
                ) : (
                    /* ── Empty state ─────────────────────────────────────── */
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
                            🗺️
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 text-lg mb-1">
                                No secrets uncovered yet
                            </h2>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                We haven&apos;t curated local insights for {displayCityTitle} yet. But we can still plan your trip!
                            </p>
                        </div>
                        <Link
                            href={`/dashboard?destination=${encodeURIComponent(displayCityTitle)}`}
                            className="bg-gray-900 text-white px-8 py-4 rounded-xl font-medium tracking-wide flex items-center gap-2 hover:bg-gray-800 transition-colors"
                        >
                            <span>PLAN THIS TRIP</span>
                            <span>→</span>
                        </Link>
                    </div>
                )}
            </section>

            {/* ── Footer nudge ─────────────────────────────────────────── */}
            <div className="pb-16 px-4 max-w-3xl mx-auto">
                <p className="text-center text-[11px] text-gray-400 uppercase tracking-[0.2em]">
                    ✦ Curated by Miru AI
                </p>
            </div>
        </main>
    );
}
