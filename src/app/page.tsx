'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

    const handleSurpriseMe = () => {
        const slugs = getAllDestinationSlugs();
        const random = slugs[Math.floor(Math.random() * slugs.length)];
        router.push(`/explore/${random}`);
    };

    return (
        <div className="min-h-screen bg-[#060F1E] text-white">
            <Navbar />

            <main className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-20 pb-16 space-y-6">

                {/* Hero Card */}
                <div className="bg-[#0A1628] rounded-[20px] p-6 md:p-8 space-y-5 border border-white/5">

                    {/* Context pill */}
                    <div className="inline-flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-full px-3 py-1 text-xs text-slate-300">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        Bali · 3 hari · Budget friendly
                    </div>

                    {/* Headline */}
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold leading-snug text-white">
                            Jangan cuma plan.{' '}
                            <span className="text-teal-400">Impikan dulu.</span>
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-slate-400 leading-relaxed">
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
                                className="shrink-0 px-4 py-2 bg-white/6 border border-white/10 rounded-full text-sm font-medium text-slate-300 hover:border-teal-400/60 hover:text-teal-300 hover:bg-teal-400/8 transition-all"
                            >
                                {label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Trending section */}
                <section className="space-y-3">
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                        Trending minggu ini
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {TRENDING.map((dest) => (
                            <Link
                                key={dest.slug}
                                href={`/explore/${dest.slug}`}
                                className="block bg-[#0A1628] border border-white/5 rounded-2xl p-4 hover:border-teal-400/30 hover:bg-[#0D1F38] transition-all group"
                            >
                                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-teal-400 bg-teal-400/10 rounded-full px-2 py-0.5 mb-2">
                                    {CATEGORY_LABELS[dest.slug] ?? 'Destinasi'}
                                </span>
                                <p className="text-sm font-bold text-white group-hover:text-teal-100 transition-colors leading-tight">
                                    {dest.name}
                                </p>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                                    {dest.quickFacts.budget}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Surprise Me card */}
                <div className="bg-[#0A1628] border border-white/8 rounded-2xl p-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-400/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Belum tahu mau ke mana?</p>
                            <p className="text-xs text-slate-500 mt-0.5">Biar Miru yang pilihkan untukmu</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSurpriseMe}
                        className="shrink-0 px-4 py-2 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-[#060F1E] text-sm font-bold rounded-xl transition-colors"
                    >
                        Surprise me
                    </button>
                </div>

                {/* Footer trust line */}
                <p className="text-center text-xs text-slate-600 pt-2">
                    Gratis untuk memulai · Tanpa kartu kredit
                </p>
            </main>
        </div>
    );
}
