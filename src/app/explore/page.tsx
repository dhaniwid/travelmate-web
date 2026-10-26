'use client';

import { useState, useMemo } from 'react';
import { Sparkles, Clock, Wallet, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { getAllDestinationSlugs, getDestination, DestinationData } from '@/data/destinations';
import LandmarkImage from '@/components/business/landmark/LandmarkImage';
import SearchBar from '@/components/business/discovery/SearchBar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import Navbar from '@/components/layout/Navbar';
import { useSubscription } from '@/hooks/useSubscription';

const CATEGORY_MAP: Record<string, { label: string; group: string }> = {
    bali: { label: 'Pantai & Spiritual', group: 'alam' },
    yogyakarta: { label: 'Budaya & Sejarah', group: 'budaya' },
    semarang: { label: 'Kolonial & Kuliner', group: 'budaya' },
    jakarta: { label: 'Urban & Kuliner', group: 'kota' },
    bandung: { label: 'Kreatif & Sejuk', group: 'kota' },
    lombok: { label: 'Pantai & Alam', group: 'alam' },
    'labuan-bajo': { label: 'Bahari & Komodo', group: 'alam' },
    medan: { label: 'Kuliner & Danau Toba', group: 'kota' },
    makassar: { label: 'Pesisir & Kuliner', group: 'kota' },
    surabaya: { label: 'Sejarah & Kota', group: 'budaya' },
};

const FILTER_TABS = [
    { id: 'all', label: 'Semua' },
    { id: 'alam', label: 'Alam & Pantai' },
    { id: 'budaya', label: 'Budaya & Sejarah' },
    { id: 'kota', label: 'Kota & Kuliner' },
];

export default function ExplorePage() {
    const [activeFilter, setActiveFilter] = useState('all');
    const { isSignedIn } = useAuth();
    const { subscription, isLoading: isSubLoading } = useSubscription();
    const router = useRouter();

    const allDestinations = useMemo<DestinationData[]>(() => {
        return getAllDestinationSlugs()
            .map((slug) => getDestination(slug))
            .filter((d): d is DestinationData => d !== null);
    }, []);

    const filteredDestinations = useMemo(() => {
        if (activeFilter === 'all') return allDestinations;
        return allDestinations.filter((d) => CATEGORY_MAP[d.slug]?.group === activeFilter);
    }, [allDestinations, activeFilter]);

    const handleCustomPlan = () => {
        if (isSignedIn) {
            router.push('/dashboard?open=planner');
        } else {
            router.push('/sign-in?redirect_url=%2Fdashboard%3Fopen%3Dplanner');
        }
    };

    return (
        <div className="min-h-screen bg-white text-zinc-950 pb-24">
            {isSignedIn ? (
                <DashboardHeader subscription={subscription ?? undefined} isSubLoading={isSubLoading} />
            ) : (
                <Navbar />
            )}

            <main className={`max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 space-y-6 ${isSignedIn ? 'pt-6' : 'pt-24'}`}>
                {/* Page Header */}
                <div>
                    {!isSignedIn && (
                        <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 text-xs font-semibold mb-2">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Kembali ke Beranda
                        </Link>
                    )}
                    <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-zinc-950 leading-snug">
                        Eksplor Destinasi
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">
                        Pilih panduan kota kurasi Miru atau ketik kota mana saja untuk mulai membuat itinerary.
                    </p>
                </div>

                {/* Search Bar */}
                <SearchBar
                    placeholder="Cari kota (mis. Bali, Malang, Tokyo)..."
                    buttonLabel="Cari →"
                />

                {/* Category Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                    isActive
                                        ? 'bg-zinc-950 text-white'
                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-950'
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Destination Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredDestinations.map((dest) => {
                        const meta = CATEGORY_MAP[dest.slug] ?? { label: 'Destinasi', group: 'all' };
                        return (
                            <Link
                                key={dest.slug}
                                href={`/explore/${dest.slug}`}
                                className="group bg-white border border-zinc-200 rounded-2xl overflow-hidden hover:border-zinc-950 transition-all flex flex-col"
                            >
                                <div className="relative h-36 bg-zinc-950 overflow-hidden">
                                    <LandmarkImage
                                        slug={dest.slug}
                                        mood="landscape"
                                        size="card"
                                        alt={dest.name}
                                        className="!absolute inset-0 !aspect-auto !h-full !rounded-none group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent" />
                                    <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/95 text-zinc-950 px-2.5 py-1 rounded-full">
                                        {meta.label}
                                    </span>
                                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                                        <h2 className="text-lg font-bold text-white leading-tight">{dest.name}</h2>
                                        <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                            <ChevronRight className="w-4 h-4 text-zinc-950 group-hover:text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                                    <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                                        {dest.tagline}
                                    </p>
                                    <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-[11px] font-semibold text-zinc-500">
                                        <span className="inline-flex items-center gap-1">
                                            <Clock className="w-3 h-3 text-teal-600" />
                                            {dest.quickFacts.duration}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-zinc-900">
                                            <Wallet className="w-3 h-3 text-teal-600" />
                                            {dest.quickFacts.budget}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Custom Destination Banner */}
                <div className="bg-zinc-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Tujuanmu tidak ada di katalog di atas?</p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                                Miru bisa membuat itinerary ke kota mana saja di Indonesia maupun luar negeri.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCustomPlan}
                        className="w-full sm:w-auto shrink-0 px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold rounded-xl transition-colors"
                    >
                        Buat Trip Kustom →
                    </button>
                </div>
            </main>
        </div>
    );
}
