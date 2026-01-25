'use client';

import {useQuery} from '@tanstack/react-query';
import {tripService} from '@/services/trip';
import HistoryCard from '@/components/business/HistoryCard';
import {Skeleton} from '@/components/ui/skeleton';
import {Plane} from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const {data, isLoading, isError} = useQuery({
        queryKey: ['trips-history'],
        queryFn: tripService.getHistory,
    });

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition">
                        <Plane className="w-6 h-6"/>
                        <span className="font-bold">TravelMate</span>
                    </Link>
                    <h1 className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-full">My Trips</h1>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 mt-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Travel History</h2>

                {/* LOADING STATE */}
                {isLoading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-3">
                                <Skeleton className="h-[120px] w-full rounded-xl"/>
                                <Skeleton className="h-4 w-[250px]"/>
                                <Skeleton className="h-4 w-[200px]"/>
                            </div>
                        ))}
                    </div>
                )}

                {/* ERROR STATE */}
                {isError && (
                    <div className="text-center p-10 bg-red-50 text-red-600 rounded-lg">
                        Failed to load history. Is the backend running?
                    </div>
                )}

                {/* EMPTY STATE */}
                {data?.data && data.data.length === 0 && (
                    <div className="text-center p-16 bg-white rounded-lg border border-dashed">
                        <p className="text-gray-400 mb-4">No trips found yet.</p>
                        <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Plan your first trip
                        </Link>
                    </div>
                )}

                {/* DATA LIST */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data?.data?.map((trip) => (
                        <HistoryCard key={trip.id} trip={trip}/>
                    ))}
                </div>
            </div>
        </main>
    );
}