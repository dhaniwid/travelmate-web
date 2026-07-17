'use client';

import { useAuth, useUser } from "@clerk/nextjs";
import { useEffect, useState, Suspense } from "react";

import Link from 'next/link';
import { useRouter, useSearchParams } from "next/navigation";
import { Trip } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Plane, MapPin, Sparkles, Compass, Waves, TreePine, Utensils, Landmark, Flower2, ChevronRight } from 'lucide-react';
import { toast } from "sonner";
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import { cn, formatDate } from '@/lib/utils';
import { useSubscription } from "@/hooks/useSubscription";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TrendingDestinations from "@/components/dashboard/TrendingDestinations";
import EmptyState from "@/components/ui/EmptyState";
import TripContextBanner from "@/components/dashboard/TripContextBanner";
import MiruRadarCard from "@/components/dashboard/MiruRadarCard";

const THEMES = [
    { theme: 'Pantai & Laut', label: 'Pantai & Laut', icon: Waves, iconColor: 'text-teal-400', iconBg: 'bg-teal-400/10', socialVal: 60 },
    { theme: 'Alam & Petualangan', label: 'Alam & Petualangan', icon: TreePine, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-400/10', socialVal: 40 },
    { theme: 'Kota & Kuliner', label: 'Kota & Kuliner', icon: Utensils, iconColor: 'text-orange-400', iconBg: 'bg-orange-400/10', socialVal: 80 },
    { theme: 'Budaya & Sejarah', label: 'Budaya & Sejarah', icon: Landmark, iconColor: 'text-amber-400', iconBg: 'bg-amber-400/10', socialVal: 30 },
    { theme: 'Relaksasi & Spa', label: 'Relaksasi & Spa', icon: Flower2, iconColor: 'text-violet-400', iconBg: 'bg-violet-400/10', socialVal: 20 },
];

function DashboardContent() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
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
    const handleCreateTrip = (options?: { isSurprise?: boolean; socialVal?: number; theme?: string }) => {
        if (isSubLoading) return;
        setIsSurpriseMode(options?.isSurprise ?? false);
        setPlannerSocialVal(options?.socialVal ?? 50);
        setPlannerTheme(options?.theme ?? '');
        setIsPlannerOpen(true);
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-[#060F1E] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                    <p className="text-slate-500 text-sm animate-pulse">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060F1E] text-white pb-24">
            <TripPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => { setIsPlannerOpen(false); setPlannerDestination(''); setPlannerSocialVal(50); setPlannerTheme(''); }}
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
            <DashboardHeader subscription={subscription ?? undefined} isSubLoading={isSubLoading} />

            <main className="max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto px-4 pt-5 space-y-5">

                {/* CONTEXTUAL TRIP BANNER */}
                {trips.length > 0 && (
                    <TripContextBanner
                        trips={trips}
                        onTripUpdated={(tripId, patch) =>
                            setTrips(prev => prev.map(t => t.id === tripId ? { ...t, ...patch } : t))
                        }
                    />
                )}

                {/* DUAL CTA */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleCreateTrip()}
                        className="bg-[#0A1628] border border-white/5 rounded-[14px] p-4 text-left hover:bg-[#0D1F38] active:scale-[0.98] transition-all"
                    >
                        <Sparkles className="w-5 h-5 text-teal-400 mb-2" />
                        <p className="text-[14px] font-medium text-white mb-0.5">Mulai Planning</p>
                        <p className="text-[11px] text-slate-400">Sudah tahu tujuan?</p>
                    </button>
                    <button
                        onClick={() => router.push('/explore')}
                        className="bg-white/8 border border-white/5 rounded-[14px] p-4 text-left hover:bg-white/12 active:scale-[0.98] transition-all"
                    >
                        <Compass className="w-5 h-5 text-slate-400 mb-2" />
                        <p className="text-[14px] font-medium text-white mb-0.5">Jelajahi Destinasi</p>
                        <p className="text-[11px] text-slate-400">Cari inspirasi dulu</p>
                    </button>
                </div>

                {/* MIRU RADAR */}
                <section>
                    <MiruRadarCard
                        onCreateTrip={(destination) => {
                            setPlannerDestination(destination);
                            setIsPlannerOpen(true);
                        }}
                    />
                </section>

                {/* MY TRIPS */}
                {trips.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Trip kamu</p>
                            {trips.length > 3 && (
                                <Link href="/trips" className="flex items-center gap-0.5 text-[12px] text-teal-400 hover:text-teal-300 transition-colors">
                                    Lihat semua <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            {sortedTrips.slice(0, 3).map(trip => {
                                const tripDate = new Date(trip.start_date ?? 0);
                                tripDate.setHours(0, 0, 0, 0);
                                const isUpcoming = tripDate.getTime() >= todayTime;
                                return (
                                    <Link key={trip.id} href={`/trips/${trip.id}`}>
                                        <div className="flex items-center gap-3 px-3 py-3 bg-[#0A1628] border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-[#060F1E] flex items-center justify-center flex-shrink-0">
                                                <MapPin className="w-4 h-4 text-teal-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[14px] font-medium text-white leading-tight truncate">{trip.destination}</p>
                                                <p className="text-[12px] text-slate-400 mt-0.5">
                                                    {formatDate(trip.start_date)} · {trip.trip_days} hari
                                                </p>
                                            </div>
                                            <span className={cn(
                                                "text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap",
                                                isUpcoming
                                                    ? "text-teal-400 bg-teal-400/10"
                                                    : "text-slate-400 bg-white/8"
                                            )}>
                                                {isUpcoming ? "Akan datang" : "Selesai"}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {trips.length === 0 && (
                    <div className="py-4">
                        <EmptyState
                            icon={Plane}
                            title="Belum ada petualangan nih! 🌍"
                            description="Trip yang kamu buat akan muncul di sini. Siap mulai perjalanan pertamamu?"
                            actionLabel="Buat Trip Pertamaku"
                            onAction={() => handleCreateTrip()}
                        />
                        <div className="mt-8">
                            <TrendingDestinations onCreateTrip={() => handleCreateTrip()} />
                        </div>
                    </div>
                )}

                {/* START WITH A THEME */}
                <section>
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Mulai dengan tema</p>
                    <div className="relative overflow-x-auto -mx-4 px-4 scrollbar-none snap-x snap-mandatory">
                        <div className="flex gap-2.5 w-max pb-2">
                            {THEMES.map((t) => (
                                <button
                                    key={t.theme}
                                    onClick={() => handleCreateTrip({ theme: t.theme, socialVal: t.socialVal })}
                                    className="snap-start flex flex-col items-center gap-2 bg-[#0A1628] border border-white/5 rounded-2xl px-4 py-4 w-[108px] min-h-[96px] justify-center hover:bg-[#0D1F38] hover:border-white/10 active:scale-[0.97] transition-all"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${t.iconBg}`}>
                                        <t.icon className={`w-5 h-5 ${t.iconColor}`} />
                                    </div>
                                    <p className="text-[11px] font-medium text-white leading-tight text-center">{t.label}</p>
                                </button>
                            ))}
                        </div>
                        {/* Right-edge fade to signal more content */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#060F1E] to-transparent" />
                    </div>
                </section>
            </main>

            {/* EXTENDED FAB */}
            {!isPlannerOpen && (
                <div className="fixed bottom-28 right-4 z-[60]">
                    <Button
                        onClick={() => handleCreateTrip()}
                        className="h-12 px-5 rounded-full bg-teal-500 hover:bg-teal-400 shadow-lg shadow-teal-900/40 text-white transition-all active:scale-95 gap-2"
                    >
                        <Plus className="w-5 h-5 flex-shrink-0" />
                        <span className="text-[14px] font-medium">Buat Trip Baru</span>
                    </Button>
                </div>
            )}
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
