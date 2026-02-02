'use client';

import { useAuth, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Trip } from '@/types';
import HistoryCard from '@/components/business/HistoryCard';
import { Button } from '@/components/ui/button';
import { Plus, Map, ArrowLeft, Loader2, Plane, Calendar } from 'lucide-react';
import { toast } from "sonner";
// Import Modal Planner
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';

export default function HistoryPage() {
    const { getToken, isLoaded, isSignedIn } = useAuth();
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

    // --- RENDER STATES ---

    // 1. Loading State
    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">Loading your adventures...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">

            {/* --- MODAL PLANNER --- */}
            {/* Kita pasang di sini. initialDestination kosong karena ini trip baru dari nol */}
            <TripPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                initialDestination=""
                onTripGenerated={(data) => {
                    setTrips(prev => [data.trip, ...prev]);
                    toast.success("Trip created successfully!");
                }}
            />

            {/* --- 1. HEADER NAV --- */}
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Map className="w-5 h-5 text-teal-600" /> My Trips
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Tombol New Trip di Header (Desktop Only) - MEMBUKA MODAL */}
                        <Button
                            size="sm"
                            onClick={() => setIsPlannerOpen(true)}
                            className="hidden md:flex gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-sm text-white border-0"
                        >
                            <Plus className="w-4 h-4" /> New Trip
                        </Button>

                        {/* Clerk Profile Menu */}
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* --- 2. EMPTY STATE --- */}
                {trips.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
                        <div className="w-32 h-32 bg-teal-50 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-teal-200 rounded-full blur-xl opacity-40 animate-pulse"></div>
                            <Plane className="w-12 h-12 text-teal-600 relative z-10" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">No trips yet?</h2>
                        <p className="text-slate-500 max-w-md mb-8 text-lg">
                            Your passport looks a bit lonely. Let's create your first memory in seconds!
                        </p>

                        {/* Tombol Empty State - MEMBUKA MODAL */}
                        <Button
                            size="lg"
                            onClick={() => setIsPlannerOpen(true)}
                            className="gap-2 bg-gradient-to-r from-teal-600 to-blue-600 hover:scale-105 transition-transform shadow-xl shadow-teal-900/20 text-white h-12 px-8 text-base"
                        >
                            <Plus className="w-5 h-5" /> Plan My First Trip
                        </Button>
                    </div>
                ) : (
                    /* --- 3. TRIP GRID --- */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                        {trips.map((trip) => (
                            <div key={trip.id} className="h-full">
                                <HistoryCard trip={trip} onDelete={handleDelete} />
                            </div>
                        ))}

                        {/* Card Tambahan: "Add New" - MEMBUKA MODAL */}
                        <div
                            onClick={() => setIsPlannerOpen(true)}
                            className="hidden md:flex group h-full min-h-[280px] border-2 border-dashed border-slate-200 rounded-2xl flex-col items-center justify-center p-6 hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer"
                        >
                            <div className="w-14 h-14 rounded-full bg-slate-50 group-hover:bg-teal-100 flex items-center justify-center mb-4 transition-colors">
                                <Plus className="w-7 h-7 text-slate-400 group-hover:text-teal-600" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-500 group-hover:text-teal-700">Plan Next Adventure</h3>
                            <p className="text-sm text-slate-400 mt-1">Ready for something new?</p>
                        </div>
                    </div>
                )}

            </main>

            {/* --- 4. MOBILE FLOATING ACTION BUTTON (FAB) --- */}
            {/* Hanya muncul di Mobile jika sudah ada trip */}
            {trips.length > 0 && (
                <div className="md:hidden fixed bottom-6 right-6 z-40">
                    <Button
                        size="icon"
                        onClick={() => setIsPlannerOpen(true)}
                        className="h-14 w-14 rounded-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-xl shadow-teal-600/30 text-white"
                    >
                        <Plus className="w-6 h-6" />
                    </Button>
                </div>
            )}
        </div>
    );
}