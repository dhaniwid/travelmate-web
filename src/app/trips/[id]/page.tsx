'use client';

import {useQuery} from '@tanstack/react-query';
import {tripService} from '@/services/trip';
import TripResult from '@/components/business/TripResult';
import {Loader2, ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import {useParams} from 'next/navigation';

export default function TripDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const {data, isLoading, isError} = useQuery({
        queryKey: ['trip', id],
        queryFn: () => tripService.getTripById(id),
        enabled: !!id, // Hanya jalan kalau ID ada
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
                <p className="text-slate-500 animate-pulse">Retrieving your plan...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-center p-4">
                <h2 className="text-xl font-bold text-red-600">Trip Not Found</h2>
                <p className="text-slate-500">We couldn't find the trip you're looking for.</p>
                <Link href="/history" className="text-blue-600 hover:underline">
                    Back to History
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Simple Header */}
            <div className="bg-white border-b px-4 py-3 sticky top-0 z-20">
                <div className="max-w-4xl mx-auto flex items-center gap-4">
                    <Link href="/history" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600"/>
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 truncate">
                        Trip to {data.trip.destination}
                    </h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 mt-4">
                {/* REUSE KOMPONEN TRIP RESULT */}
                <TripResult data={data}/>
            </div>
        </main>
    );
}