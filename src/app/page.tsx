'use client';

import { useState } from 'react';
import CreateTripForm from '@/components/business/CreateTripForm';
import TripResult from '@/components/business/TripResult';
import { TripResponse } from '@/types';
import { Plane, History, Map } from 'lucide-react';
import Link from 'next/link';
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default function Home() {
    const [result, setResult] = useState<TripResponse | null>(null);

    // Fungsi reset untuk membuat trip baru
    const handleReset = () => {
        setResult(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <main className="min-h-screen bg-slate-50 relative selection:bg-blue-100 selection:text-blue-900">

            {/* BACKGROUND PATTERN (DOTS) - Memberikan tekstur halus */}
            <div className="absolute inset-0 z-0 opacity-[0.4] pointer-events-none"
                 style={{
                     backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
                     backgroundSize: '24px 24px'
                 }}>
            </div>

            {/* HEADER MODERN & STICKY */}
            <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 transition-all">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

                    {/* Brand Logo */}
                    <div
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={handleReset}
                    >
                        <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors">
                            <Plane className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-tight">
                                TravelMate <span className="text-blue-600">AI</span>
                            </h1>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100 ml-1">BETA</span>
                    </div>

                    {/* Right Menu */}
                    <div className="flex items-center gap-3 sm:gap-6">
                        {/* Theme Switcher Button */}
                        <ThemeSwitcher />
                        <Link href="/history">
                            <button className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors group">
                                <History className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                                <span className="hidden sm:inline">My Trips</span>
                            </button>
                        </Link>

                        {/* Auth */}
                        <div className="pl-6 border-l border-slate-200 h-6 flex items-center">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 px-5 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
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

            {/* MAIN CONTENT */}
            <div className="relative z-10 max-w-5xl mx-auto px-4 pt-28 pb-20 space-y-8">

                {/* MODE 1: FORM INPUT */}
                {!result && (
                    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Hero Text - Marketing Headline */}
                        <div className="text-center mb-10 space-y-4 max-w-2xl mx-auto">
                            <h2 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight leading-tight">
                                Your Personal <br/>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
                                    AI Travel Planner
                                </span>
                            </h2>
                            <p className="text-lg text-slate-500 font-medium">
                                Stop spending hours researching. Tell us what you love, <br className="hidden sm:block"/>
                                and we'll craft the perfect itinerary in seconds.
                            </p>
                        </div>

                        {/* The Form */}
                        <CreateTripForm onSuccess={(data) => {
                            setResult(data);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }} />
                    </section>
                )}

                {/* MODE 2: RESULT VIEW */}
                {result && (
                    <section className="animate-in zoom-in-95 duration-500">
                        {/* Navigation Back */}
                        <div className="mb-6 flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm bg-white/90">
                            <button
                                onClick={handleReset}
                                className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-2 transition-all px-2 py-1 rounded-lg hover:bg-slate-50"
                            >
                                <div className="bg-slate-100 p-1.5 rounded-full">
                                    <Map className="w-4 h-4" />
                                </div>
                                <span>Create New Trip</span>
                            </button>

                            <div className="text-xs font-medium text-slate-400">
                                Trip ID: <span className="font-mono text-slate-600">{result.trip.id?.split('-')[0]}...</span>
                            </div>
                        </div>

                        <TripResult data={result} />
                    </section>
                )}

            </div>

            {/* Simple Footer */}
            <footer className="py-8 text-center text-slate-400 text-sm">
                <p>&copy; {new Date().getFullYear()} TravelMate AI. Built for explorers.</p>
            </footer>
        </main>
    );
}