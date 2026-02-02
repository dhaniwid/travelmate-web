'use client';

import {useEffect, useState} from 'react';
import {useParams} from 'next/navigation';
import {tripService} from '@/services/trip';
import {TripResponse} from '@/types';
import TripResult from '@/components/business/TripResult';
import {Loader2, ArrowLeft, AlertCircle} from 'lucide-react';
import Link from 'next/link';

export default function TripDetailPage() {
    // 1. Ambil ID dari URL (folder [id])
    const params = useParams();
    const id = params?.id as string;

    const [data, setData] = useState<TripResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // 2. Fetch Data saat halaman dibuka
    useEffect(() => {
        const fetchTrip = async () => {
            if (!id) return;

            try {
                const res = await tripService.getTripById(id);
                if (res && res.trip) {
                    setData(res);
                } else {
                    setError('Trip data not found');
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load trip details');
            } finally {
                setLoading(false);
            }
        };

        fetchTrip();
    }, [id]);

    // 3. Render Loading State
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600"/>
            </div>
        );
    }

    // 4. Render Error State
    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
                <AlertCircle className="w-12 h-12 text-slate-300 mb-4"/>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Trip Not Found</h2>
                <p className="text-slate-500 mb-6">{error || "We couldn't find the trip you're looking for."}</p>
                <Link href="/history">
                    <button
                        className="bg-white border border-slate-300 text-slate-700 font-bold py-2 px-6 rounded-full hover:bg-slate-50 transition-all">
                        Back to History
                    </button>
                </Link>
            </div>
        );
    }

    // 5. Render Success State (Reuse TripResult)
    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            {/* Simple Navigation Header */}
            <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
                    <Link href="/history" className="p-2 hover:bg-slate-100 rounded-full transition-colors group">
                        <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-blue-600"/>
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800 leading-tight">
                            Trip Details
                        </h1>
                        <p className="text-xs text-slate-400">
                            Saved on {new Date(data.trip.created_at || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8">
                <TripResult data={data} isSavedView={true}/>
            </div>
        </main>
    );
}