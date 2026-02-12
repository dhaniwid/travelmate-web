'use client';

import React, { useEffect, useState } from 'react';
import { TripResponse } from '@/types';
import TripResult from '@/components/business/TripResult';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

export default function PreviewPage() {
    const [data, setData] = useState<TripResponse | null>(null);
    const { isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        const savedData = sessionStorage.getItem('last_preview_trip');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setData(parsed);
            } catch (e) {
                console.error("Failed to parse preview data", e);
                router.push('/');
            }
        } else {
            router.push('/');
        }
    }, [router]);

    // If suddenly signed in while on this page, we should ideally "Claim" the trip
    // For now, we just stay on the page and the TripResult will show the "Save" trigger.

    if (!data) {
        return (
            <div className="h-screen flex items-center justify-center bg-white flex-col gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                <p className="text-slate-500 font-medium">Loading your adventure...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 relative">
            <Navbar />

            {/* Floating Nav for Back */}
            <nav className="fixed top-24 left-6 z-40 hidden md:block">
                <Link
                    href="/"
                    className="group flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-slate-600 text-sm font-bold border border-white/50 hover:bg-white hover:scale-105 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Search
                </Link>
            </nav>

            <TripResult data={data} isSavedView={false} />
        </main>
    );
}
