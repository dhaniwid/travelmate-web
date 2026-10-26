'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Sparkles, MapPin } from 'lucide-react';
import SearchBar from '@/components/business/discovery/SearchBar';
import Navbar from '@/components/layout/Navbar';
import { getAllDestinationSlugs, FEATURED_DESTINATIONS } from '@/data/destinations';

const CHIPS = [
    { slug: 'bali', label: 'Bali' },
    { slug: 'yogyakarta', label: 'Yogyakarta' },
    { slug: 'semarang', label: 'Semarang' },
    { slug: 'jakarta', label: 'Jakarta' },
    { slug: 'bandung', label: 'Bandung' },
];

const CATEGORY_LABELS: Record<string, string> = {
    semarang: 'Kolonial',
    yogyakarta: 'Budaya',
    bali: 'Spiritual',
    jakarta: 'Urban',
    bandung: 'Kreatif',
};

const TRENDING = FEATURED_DESTINATIONS.slice(0, 4);

export default function HomePage() {
    const router = useRouter();
    const { isLoaded, isSignedIn } = useAuth();

    // If user is already signed in, go straight to their Uber-style workspace (/dashboard)
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.replace('/dashboard');
        }
    }, [isLoaded, isSignedIn, router]);

    const handleSurpriseMe = () => {
        const slugs = getAllDestinationSlugs();
        const random = slugs[Math.floor(Math.random() * slugs.length)];
        router.push(`/explore/${random}`);
    };

    return (
        <div className="min-h-screen bg-white text-zinc-950">
            <Navbar />

            <main className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-8">

                {/* Hero Section — Solid Uber-style utility block */}
                <div className="bg-white rounded-2xl p-6 md:p-8 space-y-5 border border-zinc-200 shadow-sm">

                    {/* Context pill */}
                    <div className="inline-flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1 text-xs font-medium text-zinc-800">
                        <MapPin className="w-3.5 h-3.5 text-teal-600" />
                        Bali · 3 hari · Budget friendly
                    </div>

                    {/* Headline */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight text-zinc-950">
                            Jangan cuma plan.{' '}
                            <span className="text-teal-600">Impikan dulu.</span>
                        </h1>
                        <p className="mt-2.5 text-sm md:text-base text-zinc-600 leading-relaxed">
                            Ceritakan destinasimu — Miru siapkan semua, dari itinerary sampai akomodasi.
                        </p>
                    </div>

                    {/* Integrated search bar */}
                    <SearchBar isCompact={false} />
                </div>

                {/* Suggestion chips — horizontal scroll */}
                <div className="overflow-x-auto -mx-4 px-4 scrollbar-none">
                    <div className="flex gap-2 w-max">
                        {CHIPS.map(({ slug, label }) => (
                            <Link
                                key={slug}
                                href={`/explore/${slug}`}
                                className="shrink-0 px-4 py-2 bg-zinc-100 border border-zinc-200/80 rounded-full text-sm font-semibold text-zinc-800 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Trending section */}
                <section className="space-y-3.5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Trending minggu ini
                        </h2>
                        <Link href="/explore" className="text-xs font-semibold text-zinc-900 hover:text-teal-600 transition-colors">
                            Lihat semua →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {TRENDING.map((dest) => (
                            <Link
                                key={dest.slug}
                                href={`/explore/${dest.slug}`}
                                className="block bg-white border border-zinc-200 rounded-xl p-4 hover:border-zinc-950 hover:shadow-sm transition-all group"
                            >
                                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/60 rounded-md px-2 py-0.5 mb-2.5">
                                    {CATEGORY_LABELS[dest.slug] ?? 'Destinasi'}
                                </span>
                                <p className="text-base font-bold text-zinc-950 group-hover:text-teal-700 transition-colors leading-tight">
                                    {dest.name}
                                </p>
                                <p className="text-xs text-zinc-500 font-medium mt-1 line-clamp-1">
                                    {dest.quickFacts.budget}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Surprise Me card — High contrast Uber inverted card */}
                <div className="bg-zinc-950 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Belum tahu mau ke mana?</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Biar Miru yang pilihkan untukmu</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSurpriseMe}
                        className="shrink-0 px-4 py-2.5 bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-950 text-xs font-bold rounded-xl transition-colors"
                    >
                        Surprise me
                    </button>
                </div>

                {/* Footer trust line */}
                <p className="text-center text-xs font-medium text-zinc-400 pt-2">
                    Gratis untuk memulai · Tanpa kartu kredit
                </p>
            </main>
        </div>
    );
}
