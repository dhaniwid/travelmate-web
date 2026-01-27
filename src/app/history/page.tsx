'use client';

import {useEffect, useState} from 'react';
import {useAuth, useUser} from '@clerk/nextjs';
import {tripService} from '@/services/trip'; // Pastikan path benar
import {Trip} from '@/types';
import HistoryCard from '@/components/business/HistoryCard';
import {Loader2, Plane, ArrowLeft} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const {isLoaded, isSignedIn} = useUser();
    const {getToken} = useAuth(); // Clerk Token

    const [trips, setTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!isLoaded || !isSignedIn) return;

            try {
                // Ambil token untuk autentikasi backend
                // const token = await getToken();
                // Note: Jika backend endpoint /trips public (user_id filter), token opsional.
                // Tapi best practice kirim token jika endpoint secured.

                const response = await tripService.getHistory();
                // Jika struktur response backend { data: [...] }
                setTrips(response.data || []);
            } catch (error) {
                console.error("Failed to load history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [isLoaded, isSignedIn, getToken]);

    // --- RENDER STATES ---

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-center p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Sign in Required</h2>
                <p className="text-slate-500 mb-6">Please sign in to view your travel history.</p>
                <Link href="/">
                    <button className="text-blue-600 font-bold hover:underline">Go Home</button>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600"/>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">My Trips</h1>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto p-4 md:p-8">
                {trips.length === 0 ? (
                    // Empty State
                    <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
                        <div
                            className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Plane className="w-8 h-8"/>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No trips found</h3>
                        <p className="text-slate-500 mb-6">You haven't saved any trips yet.</p>
                        <Link href="/">
                            <button
                                className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-all">
                                Plan a New Trip
                            </button>
                        </Link>
                    </div>
                ) : (
                    // Grid Layout
                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {trips.map((trip) => (
                            <HistoryCard key={trip.id} trip={trip}/>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}