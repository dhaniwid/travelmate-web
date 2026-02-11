'use client';

import { useAuth, useUser, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Trip } from '@/types';
import TripGalleryCard from '@/components/business/TripGalleryCard';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, Plane, Calendar, MapPin, Clock, ArrowRight } from 'lucide-react';
import { toast } from "sonner";
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import { fetchUnsplashImage } from '@/services/imageService';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const [trips, setTrips] = useState<Trip[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [heroImage, setHeroImage] = useState<string | null>(null);

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
                onTripGenerated={(data) => {
                    setTrips(prev => [data.trip, ...prev]);
                    toast.success("Trip created successfully!");
                }}
            />

            {/* HEADER */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-800">
                            Hello, {user?.firstName || 'Traveler'} 👋
                        </h1>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">

                {/* EMPTY STATE */}
                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-32 h-32 bg-gradient-to-br from-teal-100 to-blue-100 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-teal-200 rounded-full blur-xl opacity-40 animate-pulse"></div>
                            <Plane className="w-16 h-16 text-teal-600 relative z-10 rotate-45" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
                            Plan Your First Dream Trip
                        </h2>
                        <p className="text-slate-500 max-w-md mb-8 text-lg">
                            Your adventure starts here. Let AI craft the perfect itinerary tailored to your vibe.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setIsPlannerOpen(true)}
                            className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 hover:scale-105 transition-transform shadow-xl shadow-teal-900/20 text-white h-14 px-10 text-lg"
                        >
                            <Plus className="w-6 h-6" /> Start Planning
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* NEXT ADVENTURE - BOARDING PASS HERO CARD */}
                        {nextTrip && (
                            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                                    <Plane className="w-6 h-6 text-teal-600" />
                                    Next Adventure
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

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                        {/* Content */}
                                        <div className="relative z-10 p-8 md:p-12 min-h-[280px] flex flex-col justify-between">
                                            {/* Top Section */}
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

                                            {/* Bottom Section - Boarding Pass Style */}
                                            <div className="flex items-end justify-between border-t border-white/20 pt-6">
                                                <div className="space-y-1">
                                                    <p className="text-white/60 text-xs uppercase tracking-wider">Departure</p>
                                                    <p className="text-white font-bold flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {new Date(nextTrip.start_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
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

                                            {/* Barcode decoration */}
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
                        )}

                        {/* YOUR COLLECTION - GRID */}
                        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                                    Recent Plans
                                </h2>
                                <Link
                                    href="/history"
                                    className="hidden md:flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700 hover:underline transition-all"
                                >
                                    View All Trips <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {trips.slice(0, 3).map((trip) => (
                                    <TripGalleryCard
                                        key={trip.id}
                                        trip={trip}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>

                            {/* Mobile View All Link */}
                            <div className="mt-6 md:hidden text-center">
                                <Link
                                    href="/history"
                                    className="inline-flex items-center gap-1 text-sm font-bold text-teal-600 hover:text-teal-700"
                                >
                                    View All Trips <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* FLOATING ACTION BUTTON */}
            <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60]">
                <Button
                    size="icon"
                    onClick={() => setIsPlannerOpen(true)}
                    className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-gradient-to-tr from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-2xl shadow-teal-500/40 text-white transition-all active:scale-95 hover:scale-110"
                    title="Plan New Trip"
                >
                    <Plus className="w-6 h-6 md:w-8 md:h-8" />
                </Button>
            </div>
        </div>
    );
}
