'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";

import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import { Trip } from '@/types';
import { Loader2, MapPin, Sparkles, Compass, Waves, TreePine, Utensils, Landmark, Flower2, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import SearchBar from '@/components/business/discovery/SearchBar';
import { cn, formatDate } from '@/lib/utils';
import { useSubscription } from "@/hooks/useSubscription";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import UpgradeModal from "@/components/ui/UpgradeModal";
import TripContextBanner from "@/components/dashboard/TripContextBanner";
import MiruRadarCard from "@/components/dashboard/MiruRadarCard";

const THEMES = [
    { theme: 'Pantai & Laut', label: 'Pantai & Laut', icon: Waves, iconColor: 'text-teal-600', iconBg: 'bg-teal-50', socialVal: 60 },
    { theme: 'Alam & Petualangan', label: 'Alam & Petualangan', icon: TreePine, iconColor: 'text-zinc-900', iconBg: 'bg-zinc-100', socialVal: 40 },
    { theme: 'Kota & Kuliner', label: 'Kota & Kuliner', icon: Utensils, iconColor: 'text-zinc-900', iconBg: 'bg-zinc-100', socialVal: 80 },
    { theme: 'Budaya & Sejarah', label: 'Budaya & Sejarah', icon: Landmark, iconColor: 'text-zinc-900', iconBg: 'bg-zinc-100', socialVal: 30 },
    { theme: 'Relaksasi & Spa', label: 'Relaksasi & Spa', icon: Flower2, iconColor: 'text-teal-600', iconBg: 'bg-teal-50', socialVal: 20 },
];

function DashboardContent() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [showUpgrade, setShowUpgrade] = useState(false);
    const [showAllTrips, setShowAllTrips] = useState(false);
    const [isSurpriseMode, setIsSurpriseMode] = useState(false);
    const [plannerDestination, setPlannerDestination] = useState('');
    const [plannerSocialVal, setPlannerSocialVal] = useState(50);
    const [plannerTheme, setPlannerTheme] = useState('');
    const searchParams = useSearchParams();

    // Subscription Hook
    const { subscription, isLoading: isSubLoading } = useSubscription();

    // Fetch Trips
    useEffect(() => {
        const fetchTrips = async () => {
            if (!isLoaded || !isSignedIn) return;

            try {
                const token = await getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (res.ok) {
                    const json = await res.json();
                    setTrips(json.data || []);
                } else {
                    toast.error("Gagal memuat trip kamu");
                }
            } catch (err) {
                console.error(err);
                toast.error("Terjadi kesalahan, coba lagi");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, [isLoaded, isSignedIn, getToken]);

    // Open planner from /explore/[destination] → "Plan My Trip" CTA
    // Falls back to localStorage because Clerk OAuth redirect strips query params
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        const openParam = searchParams.get('open');
        const destParam = searchParams.get('destination');
        const pendingDest = localStorage.getItem('pending_planner_destination');

        if (openParam === 'planner' || pendingDest) {
            setPlannerDestination(destParam ?? pendingDest ?? '');
            setIsPlannerOpen(true);
            localStorage.removeItem('pending_planner_destination');
        }
    }, [searchParams, isLoaded, isSignedIn]);

    // Handle post-signup redirect for pending trips & claiming
    useEffect(() => {
        if (!isLoaded || !isSignedIn || !user) return;

        const handlePendingActions = async () => {
            const claimTripId = localStorage.getItem('pending_claim_trip_id');
            const pendingTripId = localStorage.getItem('pending_trip_id');

            // 1. Claim Trip if needed
            if (claimTripId) {
                try {
                    const { claimTripAction } = await import('@/actions/trip-claim');
                    const res = await claimTripAction(claimTripId, user.id);
                    if (res.success) {
                        localStorage.removeItem('pending_claim_trip_id');
                        toast.success("Trip berhasil diklaim ke akunmu! ✨");
                    }
                } catch (err) {
                    console.error("Failed to claim trip:", err);
                }
            }

            // 2. Redirect back if needed
            if (pendingTripId) {
                localStorage.removeItem('pending_trip_id');
                toast.success("Selamat datang kembali! Membuka trip kamu...");
                router.push(`/trips/${pendingTripId}`);
            }
        };

        handlePendingActions();
    }, [isLoaded, isSignedIn, user, router]);

    // Filter and sort trips
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const sortedTrips = [...trips].sort((a, b) =>
        new Date(a.start_date ?? 0).getTime() - new Date(b.start_date ?? 0).getTime()
    );

    // Handle Delete
    const handleDelete = async (id: string) => {
        try {
            const token = await getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                setTrips(prev => prev.filter(t => t.id !== id));
                toast.success("Trip deleted successfully");
            } else {
                toast.error("Failed to delete trip");
            }
        } catch (error) {
            toast.error("Error deleting trip");
        }
    };

    // Handle Create Trip Click
    const handleCreateTrip = (options?: { destination?: string; isSurprise?: boolean; socialVal?: number; theme?: string }) => {
        if (isSubLoading) return;
        setPlannerDestination(options?.destination ?? '');
        setIsSurpriseMode(options?.isSurprise ?? false);
        setPlannerSocialVal(options?.socialVal ?? 50);
        setPlannerTheme(options?.theme ?? '');
        setIsPlannerOpen(true);
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-zinc-950 animate-spin" />
                    <p className="text-zinc-500 text-sm font-medium animate-pulse">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    const visibleTrips = showAllTrips ? sortedTrips : sortedTrips.slice(0, 3);

    return (
        <div className="min-h-screen bg-white text-zinc-950 pb-24">
            <TripPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => { setIsPlannerOpen(false); setPlannerDestination(''); setPlannerSocialVal(50); setPlannerTheme(''); setIsSurpriseMode(false); }}
                initialDestination={plannerDestination}
                initialIsSurprise={isSurpriseMode}
                initialSocialVal={plannerSocialVal}
                initialTheme={plannerTheme}
                onTripGenerated={(data) => {
                    setTrips(prev => [data.trip, ...prev]);
                    toast.success("Trip berhasil dibuat!");
                    if (data.trip?.id) {
                        router.push(`/trips/${data.trip.id}`);
                    }
                }}
            />

            {/* HEADER */}
            <DashboardHeader subscription={subscription ?? undefined} isSubLoading={isSubLoading} onUpgradeClick={() => setShowUpgrade(true)} />

            <main className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-6 space-y-7">

                {/* ── BLOK 1: UBER-STYLE "MAU LIBURAN KE MANA?" ACTION BOX (ADR-001) ── */}
                <section className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="font-display text-xl md:text-2xl font-bold tracking-tight text-zinc-950 leading-snug">
                                Mau liburan ke mana{user?.firstName ? `, ${user.firstName}` : ''}?
                            </h1>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Ketik kota tujuan untuk melihat tempat eksotis &amp; kuliner terbaiknya
                            </p>
                        </div>
                        <button
                            onClick={() => handleCreateTrip({ isSurprise: true })}
                            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                            Surprise Me
                        </button>
                    </div>

                    <SearchBar
                        placeholder="Ketik kota tujuan (mis. Denpasar, Malang, Tokyo)..."
                        buttonLabel="Eksplor →"
                    />
                </section>

                {/* ── BLOK 2: ACTIVE TRIP BANNER & MY TRIPS ── */}
                {trips.length > 0 ? (
                    <section className="space-y-4">
                        <TripContextBanner
                            trips={trips}
                            onTripUpdated={(tripId, patch) =>
                                setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...patch } : t))
                            }
                        />

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                                    Trip kamu ({trips.length})
                                </p>
                                {trips.length > 3 && (
                                    <button
                                        onClick={() => setShowAllTrips(prev => !prev)}
                                        className="flex items-center gap-0.5 text-xs font-semibold text-zinc-950 hover:text-teal-600 transition-colors"
                                    >
                                        {showAllTrips ? 'Tampilkan ringkas' : `Lihat semua (${trips.length})`}
                                        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showAllTrips && "rotate-90")} />
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-2.5">
                                {visibleTrips.map(trip => {
                                    const tripDate = new Date(trip.start_date ?? 0);
                                    tripDate.setHours(0, 0, 0, 0);
                                    const isUpcoming = tripDate.getTime() >= todayTime;
                                    return (
                                        <Link key={trip.id} href={`/trips/${trip.id}`}>
                                            <div className="flex items-center gap-3.5 px-4 py-3.5 bg-white border border-zinc-200 rounded-xl hover:border-zinc-950 transition-all">
                                                <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                                                    <MapPin className="w-4 h-4 text-zinc-900" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[15px] font-bold text-zinc-950 leading-tight truncate">{trip.destination}</p>
                                                    <p className="text-[12px] text-zinc-500 font-medium mt-0.5">
                                                        {formatDate(trip.start_date)} · {trip.trip_days} hari
                                                    </p>
                                                </div>
                                                <span className={cn(
                                                    "text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap",
                                                    isUpcoming
                                                        ? "text-teal-800 bg-teal-50 border border-teal-200/60"
                                                        : "text-zinc-600 bg-zinc-100"
                                                )}>
                                                    {isUpcoming ? "Akan datang" : "Selesai"}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="bg-zinc-50 border border-zinc-200 rounded-2xl p-5 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-zinc-950">Belum ada rencana perjalanan</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                                Ketik kota di kotak pencarian di atas untuk membuat itinerary pertamamu dalam 30 detik.
                            </p>
                        </div>
                        <button
                            onClick={() => handleCreateTrip()}
                            className="shrink-0 px-4 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-colors"
                        >
                            + Buat Trip
                        </button>
                    </section>
                )}

                {/* ── BLOK 3: INSPIRASI DESTINASI (Miru Radar Hidden Pending Implementation) ── */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Inspirasi Destinasi</p>
                        <Link href="/explore" className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-950 hover:text-teal-600 transition-colors">
                            <Compass className="w-3.5 h-3.5 text-teal-600" />
                            Eksplor 10+ Kota →
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                            { name: 'Bali', slug: 'bali', tag: 'Pantai & Budaya' },
                            { name: 'Yogyakarta', slug: 'yogyakarta', tag: 'Warisan & Kuliner' },
                            { name: 'Bandung', slug: 'bandung', tag: 'Alam & Kafe' },
                            { name: 'Labuan Bajo', slug: 'labuan-bajo', tag: 'Bahari Eksotis' },
                        ].map((city) => (
                            <Link
                                key={city.slug}
                                href={`/explore/${city.slug}`}
                                className="p-3.5 rounded-xl border border-zinc-200 bg-white hover:border-zinc-950 transition-all group"
                            >
                                <p className="text-sm font-bold text-zinc-950 group-hover:text-teal-700 transition-colors">
                                    {city.name}
                                </p>
                                <p className="text-xs text-zinc-500 mt-0.5">{city.tag}</p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense>
            <DashboardContent />
        </Suspense>
    );
}
