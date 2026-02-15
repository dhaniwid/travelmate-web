'use client';

import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Trip } from '@/types';
import TripGalleryCard from '@/components/business/TripGalleryCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Plane, Calendar, MapPin, Clock, ArrowRight, Zap, Sparkles } from 'lucide-react';
import { toast } from "sonner";
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import { fetchUnsplashImage } from '@/services/imageService';
import { cn, formatDate } from '@/lib/utils';
import { useSubscription } from "@/hooks/useSubscription";
import QuotaIndicator from "@/components/dashboard/QuotaIndicator";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TrendingDestinations from "@/components/dashboard/TrendingDestinations";
import EmptyState from "@/components/ui/EmptyState";

export default function DashboardPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [isSurpriseMode, setIsSurpriseMode] = useState(false);
    const [heroImage, setHeroImage] = useState<string | null>(null);

    // Subscription Hook
    const { subscription, quota, isLoading: isSubLoading } = useSubscription();

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
                    toast.error("Failed to load your trips");
                }
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrips();
    }, [isLoaded, isSignedIn, getToken]);

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
                        toast.success("Trip successfully claimed to your account! ✨");
                    }
                } catch (err) {
                    console.error("Failed to claim trip:", err);
                }
            }

            // 2. Redirect back if needed
            if (pendingTripId) {
                localStorage.removeItem('pending_trip_id');
                toast.success("Welcome back! Loading your saved trip...");
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
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );

    const nextTrip = sortedTrips.find(t =>
        new Date(t.start_date).getTime() >= todayTime
    );

    // Load hero image for next trip
    useEffect(() => {
        if (!nextTrip) return;

        const loadHeroImage = async () => {
            try {
                const url = await fetchUnsplashImage(nextTrip.destination);
                setHeroImage(url);
            } catch (error) {
                console.error("Failed to load hero image", error);
            }
        };

        loadHeroImage();
    }, [nextTrip?.destination]);

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

    // Calculate countdown for next trip
    const getCountdown = (trip: Trip) => {
        const startDate = new Date(trip.start_date);
        startDate.setHours(0, 0, 0, 0);
        const diffTime = startDate.getTime() - todayTime;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Tomorrow";
        return `In ${diffDays} days`;
    };

    // Handle Create Trip Click
    const handleCreateTrip = (options?: { isSurprise?: boolean }) => {
        if (isSubLoading) return;

        // Check Quota
        // ... (keep quota logic)
        const isPro = subscription?.subscription_tier === 'PRO';
        const remaining = quota?.remaining ?? 0;

        if (!isPro && remaining <= 0) {
            toast.error("You've reached your free trip limit for this month.", {
                action: {
                    label: "Upgrade",
                    onClick: () => router.push('/pricing')
                }
            });
            setTimeout(() => router.push('/pricing'), 1500);
            return;
        }

        setIsSurpriseMode(options?.isSurprise ?? false);
        setIsPlannerOpen(true);
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <TripPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                initialDestination=""
                initialIsSurprise={isSurpriseMode}
                onTripGenerated={(data) => {
                    setTrips(prev => [data.trip, ...prev]);
                    toast.success("Trip created successfully!");
                    if (data.trip?.id) {
                        router.push(`/trips/${data.trip.id}`);
                    }
                }}
            />

            {/* HEADER */}
            <DashboardHeader quota={quota ?? undefined} subscription={subscription ?? undefined} isSubLoading={isSubLoading} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* SECTION 1: DREAM INPUT (HERO REDESIGNED) */}
                <section className="relative rounded-[3rem] overflow-hidden min-h-[420px] flex items-center justify-center text-center px-4 shadow-2xl shadow-teal-900/20">
                    {/* CSS MESH GRADIENT BACKGROUND */}
                    <div className="absolute inset-0 z-0 bg-slate-900">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-900 via-slate-900 to-black opacity-90" />
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/30 rounded-full blur-[128px]" />
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-[128px]" />
                        {/* Subtle Grid Pattern */}
                        <div
                            className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), 
                                                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                                backgroundSize: '40px 40px'
                            }}
                        />
                    </div>

                    <div className="relative z-10 max-w-3xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-700">
                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none drop-shadow-xl">
                                Plan your dream trip, <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-teal-400">{user?.firstName || 'Traveler'}</span>
                            </h2>
                            <p className="text-xl md:text-2xl text-slate-300 font-medium max-w-2xl mx-auto">
                                Let's craft a personalized day-by-day itinerary in seconds.
                            </p>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={() => handleCreateTrip()}
                                size="lg"
                                className="h-14 px-8 rounded-full text-lg font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-[0_0_20px_rgba(13,148,136,0.3)] transition-all hover:scale-105 active:scale-95"
                            >
                                <Sparkles className="w-5 h-5 mr-2" />
                                Start Planning
                            </Button>

                            <Button
                                onClick={() => handleCreateTrip({ isSurprise: true })}
                                variant="outline"
                                size="lg"
                                className="h-14 px-8 rounded-full text-lg font-bold bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                            >
                                <Zap className="w-5 h-5 mr-2 text-amber-400" />
                                Surprise Me
                            </Button>
                        </div>
                    </div>
                </section>

                {nextTrip ? (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 mt-12">
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                            <Plane className="w-6 h-6 text-teal-600" />
                            Your Upcoming Trip
                        </h2>
                        <Link href={`/trips/${nextTrip.id}`}>
                            <div className="group relative rounded-3xl overflow-hidden bg-white border-2 border-slate-200 hover:border-teal-400 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer">
                                {/* Background Image */}
                                <div className="absolute inset-0 w-full h-full">
                                    {heroImage ? (
                                        <img
                                            src={heroImage}
                                            alt={nextTrip.destination}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-teal-600 via-blue-600 to-indigo-600" />
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="relative z-10 p-8 md:p-12 min-h-[280px] flex flex-col justify-between">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                                                Boarding Pass
                                            </p>
                                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                                                {nextTrip.destination}
                                            </h3>
                                        </div>
                                        <div className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold flex items-center gap-2">
                                            <Clock className="w-4 h-4" />
                                            {getCountdown(nextTrip)}
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between border-t border-white/20 pt-6">
                                        <div className="space-y-1">
                                            <p className="text-white/60 text-xs uppercase tracking-wider">Departure</p>
                                            <p className="text-white font-bold flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(nextTrip.start_date)}
                                            </p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-white/60 text-xs uppercase tracking-wider">Duration</p>
                                            <p className="text-white font-bold">{nextTrip.trip_days} Days</p>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-white/60 text-xs uppercase tracking-wider">From</p>
                                            <p className="text-white font-bold flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {nextTrip.origin}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="absolute right-8 bottom-8 flex gap-1 opacity-20">
                                        {[...Array(8)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-white rounded-full"
                                                style={{ height: `${20 + Math.random() * 30}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </section>
                ) : (
                    /* EMPTY STATE: Replaced TrendingDestinations with the new EmptyState component */
                    <div className="mt-12">
                        <EmptyState
                            icon={Plane}
                            title="No adventures yet! 🌍"
                            description="Your future trips will appear here. Ready to plan your first miracle journey?"
                            actionLabel="Create My First Trip"
                            onAction={() => handleCreateTrip()}
                        />
                        <div className="mt-20">
                            <h3 className="text-xl font-bold text-slate-800 mb-8 px-2">Or get inspired by these spots:</h3>
                            <TrendingDestinations onCreateTrip={() => handleCreateTrip()} />
                        </div>
                    </div>
                )}

                {/* SECTION 3: QUICK START TEMPLATES (HIDDEN FOR NOW) */}
                {/* <section>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Start with a Theme</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Foodie Paradise', count: 'Culinary Focus', color: 'bg-orange-100 text-orange-800' },
                            { title: 'Hidden Gems', count: 'Off-path Spots', color: 'bg-indigo-100 text-indigo-800' },
                            { title: 'Nature Retreat', count: 'Relaxed Pace', color: 'bg-emerald-100 text-emerald-800' },
                        ].map((col, idx) => (
                            <div
                                key={idx}
                                onClick={() => handleCreateTrip()} // TODO: Pass specific theme props in future
                                className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:bg-slate-50"
                            >
                                <div className={cn("w-12 h-12 rounded-full mb-4 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform", col.color)}>
                                    {col.title[0]}
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{col.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500 font-medium">{col.count}</span>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section> */}
            </main>

            {/* FLOATING ACTION BUTTON */}
            {!isPlannerOpen && (
                <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] animate-in fade-in duration-300">
                    <Button
                        size="icon"
                        onClick={() => handleCreateTrip()}
                        className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-tr from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-2xl shadow-teal-500/40 text-white transition-all active:scale-95 hover:scale-110"
                        title="Plan New Trip"
                    >
                        <Plus className="w-6 h-6 md:w-8 md:h-8" />
                    </Button>
                </div>
            )}
        </div>
    );
}
