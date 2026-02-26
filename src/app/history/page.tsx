'use client';

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trip } from '@/types';
import TripGalleryCard from '@/components/business/TripGalleryCard';
import { Button } from '@/components/ui/button';
import { Plus, Map, ArrowLeft, Loader2, Plane, Calendar, Globe } from 'lucide-react';
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";
// Import Modal Planner
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';

// Inspiration cards for the empty state — clicking any card opens the planner
const INSPIRATION_CARDS = [
    {
        destination: "Bali",
        emoji: "🌴",
        title: "3 Hari Santai di Bali",
        subtitle: "Pantai, sawah, & spa mewah",
        tag: "Populer 🔥",
    },
    {
        destination: "Kyoto",
        emoji: "⛩️",
        title: "Eksplorasi Budaya Kyoto",
        subtitle: "Kuil bersejarah & taman Zen",
        tag: "Cultural 🎌",
    },
    {
        destination: "Bangkok",
        emoji: "🍜",
        title: "Kuliner Jalanan Bangkok",
        subtitle: "Street food & pasar malam",
        tag: "Foodie 🌶️",
    },
];

export default function HistoryPage() {

    const { getToken, isLoaded, isSignedIn } = useAuth();
    const router = useRouter();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // STATE UNTUK MODAL
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);

    // Fetch Trips
    useEffect(() => {
        const fetchHistory = async () => {
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
                    toast.error("Failed to load history");
                }
            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [isLoaded, isSignedIn, getToken]);

    // Handle Delete (Optimistic Update)
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

    // HANDLE TRIP GENERATED: Auto-redirect to trip page
    const handleTripGenerated = (data: any) => {
        const newTrip = data.trip;

        // Prevent duplicates (Fixes "Two children with same key" error)
        setTrips(prev => {
            if (prev.some(t => t.id === newTrip.id)) return prev;
            return [newTrip, ...prev];
        });

        toast.success("Trip created! Redirecting...");

        // ALWAYS redirect to /trips/:id
        if (newTrip?.id) {
            // Use router.push to navigate
            router.push(`/trips/${newTrip.id}`);
        } else {
            router.push('/');
        }
    };

    // --- RENDER STATES ---

    // --- 4. RENDER STATES ---

    // Upcoming vs Past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    const sortedTrips = [...trips].sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    const upcomingTrips = sortedTrips.filter(t => new Date(t.start_date).getTime() >= todayTime);
    const pastTrips = sortedTrips.filter(t => new Date(t.start_date).getTime() < todayTime).reverse();

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Curating your gallery...</p>
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
                onTripGenerated={handleTripGenerated}
            />

            {/* HEADER NAV */}
            <PageHeader
                title="My Adventures"
                subtitle="Your travel history and upcoming plans"
                className="sticky top-0 z-30 rounded-b-[2rem]"
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-10">
                        {/* Hero */}
                        <div className="space-y-3">
                            <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto relative">
                                <div className="absolute inset-0 bg-teal-200 rounded-full blur-xl opacity-40 animate-pulse" />
                                <Globe className="w-9 h-9 text-teal-600 relative z-10" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-snug">
                                Belum ada petualangan yang direncanakan?<br />
                                <span className="text-teal-600">Mari kita mulai.</span>
                            </h2>
                            <p className="text-slate-500 max-w-sm mx-auto text-base">
                                Buat rencana perjalanan pertamamu bersama Miru — cukup beritahu vibe-nya, biarkan AI yang merancang.
                            </p>
                        </div>

                        {/* Inspiration Cards */}
                        <div className="w-full max-w-2xl">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">✨ Butuh inspirasi? Coba salah satu ini</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {INSPIRATION_CARDS.map((card) => (
                                    <button
                                        key={card.destination}
                                        onClick={() => setIsPlannerOpen(true)}
                                        className="group relative text-left p-5 rounded-2xl border border-slate-100 bg-white hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    >
                                        <div className="text-3xl mb-3">{card.emoji}</div>
                                        <p className="font-black text-slate-800 text-sm leading-tight">{card.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
                                        <span className="mt-3 inline-block text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">
                                            {card.tag}
                                        </span>
                                        <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-teal-500">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            size="lg"
                            onClick={() => setIsPlannerOpen(true)}
                            className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:scale-105 transition-transform shadow-xl shadow-teal-900/20 text-white h-12 px-8 text-base"
                        >
                            <Plus className="w-5 h-5" /> Buat Perjalananku Sendiri
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-16">

                        {/* UPCOMING ADVENTURES */}
                        {upcomingTrips.length > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        Upcoming Adventures
                                        <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider">
                                            {upcomingTrips.length}
                                        </span>
                                    </h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsPlannerOpen(true)}
                                        className="hidden md:flex gap-2 rounded-full border-slate-200 hover:bg-slate-50 text-slate-600"
                                    >
                                        <Plus className="w-4 h-4" /> New Adventure
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {/* Plan New Card REMOVED - Using Header Button / FAB instead */}

                                    {upcomingTrips.map((trip) => (
                                        <TripGalleryCard key={trip.id} trip={trip} onDelete={handleDelete} />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* PAST JOURNEYS */}
                        {pastTrips.length > 0 && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                                <div className="mb-8 border-b border-slate-200 pb-4">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                        Past Journeys
                                        <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                            {pastTrips.length}
                                        </span>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 grayscale-0 hover:grayscale-0 transition-all">
                                    {pastTrips.map((trip) => (
                                        <div key={trip.id} className="opacity-80 hover:opacity-100 transition-opacity">
                                            <TripGalleryCard trip={trip} onDelete={handleDelete} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>

            {/* MOBILE FAB */}
            <div className="md:hidden fixed bottom-24 right-4 z-40">
                <Button
                    size="icon"
                    onClick={() => setIsPlannerOpen(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-tr from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-2xl shadow-teal-500/40 text-white transition-all active:scale-95"
                >
                    <Plus className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}