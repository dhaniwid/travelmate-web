'use client';

import { useState } from 'react';
import CreateTripForm from '@/components/business/CreateTripForm';
import TripResult from '@/components/business/TripResult';
import { TripResponse } from '@/types';
import { Plane, History } from 'lucide-react';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
    const [result, setResult] = useState<TripResponse | null>(null);

    // Fungsi reset untuk membuat trip baru
    const handleReset = () => {
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-slate-50 pb-20">

            {/* HEADER MODERN */}
            <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Brand Logo */}
                    <div
                        className="flex items-center gap-2 text-blue-700 cursor-pointer"
                        onClick={handleReset} // Klik logo reset ke home
                    >
                        <Plane className="w-6 h-6" />
                        <h1 className="text-xl font-bold tracking-tight hidden sm:block">TravelMate AI</h1>
                        <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-1">Beta 1.0</span>
                    </div>

                    {/* Right Menu: History & Auth */}
                    <div className="flex items-center gap-4">
                        <Link href="/history">
                            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition px-3 py-2 rounded-lg hover:bg-slate-50">
                                <History className="w-4 h-4" />
                                <span className="hidden sm:inline">History</span>
                            </button>
                        </Link>

                        {/* Auth Buttons (Inside Header) */}
                        <div className="pl-4 border-l border-slate-200">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 px-4 rounded-full shadow-sm transition-all">
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>

                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto p-4 space-y-8 mt-6">

                {/* CONTENT SECTION */}
                {!result && (
                    <section className="animate-in fade-in duration-500 py-10">
                        <div className="text-center mb-10">
                            <h2 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">
                                Where to next?
                            </h2>
                            <p className="text-lg text-slate-500">
                                Let AI design your perfect trip in seconds.
                            </p>
                        </div>
                        <CreateTripForm onSuccess={(data) => setResult(data)} />
                    </section>
                )}

                {/* RESULT SECTION */}
                {result && (
                    <section>
                        <div className="mb-6 flex justify-between items-center">
                            <button
                                onClick={handleReset}
                                className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors group"
                            >
                                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                                Plan another trip
                            </button>
                        </div>
                        <TripResult data={result} />
                    </section>
                )}

            </div>
        </main>
    );
}