'use client';

import { useState } from 'react';
import CreateTripForm from '@/components/business/CreateTripForm';
import TripResult from '@/components/business/TripResult';
import { TripResponse } from '@/types';
import { Plane } from 'lucide-react';
import Link from 'next/link'; // Import Link
import { History } from 'lucide-react'; // Import Icon

export default function Home() {
    const [result, setResult] = useState<TripResponse | null>(null);

    // Fungsi reset untuk membuat trip baru
    const handleReset = () => {
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            {/* Header Modern */}
            <header className="bg-white border-b sticky top-0 z-20">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-700">
                        <Plane className="w-6 h-6" />
                        <h1 className="text-xl font-bold tracking-tight">TravelMate AI</h1>
                    </div>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Beta 1.0</span>

                    <Link href="/history">
                        <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">My History</span>
                        </button>
                    </Link>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 space-y-8 mt-6">

                {/* Jika belum ada result, tampilkan Form */}
                {!result && (
                    <section className="animate-in fade-in duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Where to next?</h2>
                            <p className="text-slate-500">Let AI design your perfect trip in seconds.</p>
                        </div>
                        <CreateTripForm onSuccess={(data) => setResult(data)} />
                    </section>
                )}

                {/* Jika sudah ada result, tampilkan TripResult */}
                {result && (
                    <section>
                        <div className="mb-4">
                            <button
                                onClick={handleReset}
                                className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
                            >
                                ← Plan another trip
                            </button>
                        </div>
                        <TripResult data={result} />
                    </section>
                )}

            </div>
        </main>
    );
}