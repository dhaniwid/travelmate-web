'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroHeader from '@/components/business/discovery/HeroHeader';
import SearchBar from '@/components/business/discovery/SearchBar';
import SuggestionChips from '@/components/business/discovery/SuggestionChips';
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import { TripResponse } from '@/types';
import Navbar from '@/components/layout/Navbar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

export default function HomePage() {
    // --- HOOKS & STATES ---
    const router = useRouter();
    const { isSignedIn } = useAuth();
    const [searchCity, setSearchCity] = useState('');
    const [isLoading] = useState(false);

    // State untuk Modal
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);

    // State baru: Menentukan kota apa yang dikirim ke Form
    // Jika kosong = User mengetik sendiri di form (Direct Flow)
    // Jika terisi = Auto-fill dari Discovery (Discovery Flow)
    const [plannerDestination, setPlannerDestination] = useState('');

    // --- HELPERS ---
    // Transition to Preview-First: Allow unauthenticated generation
    const openPlannerWithAuthCheck = (destination: string) => {
        // We no longer block here. Instead, we let them generate.
        // We show a conversion toast to encourage sign-in
        if (!isSignedIn) {
            // No longer using toast.info here to avoid overlap with modal header.
            // Information will be displayed inside CreateTripForm.
        }
        setPlannerDestination(destination);
        setIsPlannerOpen(true);
    };

    // --- HANDLERS ---

    // 1. Search Handler (Directly opens planner now)
    const handleSearch = () => {
        if (!searchCity.trim()) return;
        openPlannerWithAuthCheck(searchCity);
    };

    const handleChipSelect = (city: string) => {
        setSearchCity(city);
        openPlannerWithAuthCheck(city);
    };

    // 3. Direct Plan Handler (Triggered from "Surprise Me")
    const handleSurpriseMe = () => {
        openPlannerWithAuthCheck(''); // Empty dest triggers "Surprise Me" logic in AI backend
    };

    const handleTripGenerated = (data: TripResponse) => {
        toast.success("Trip created! Redirecting...");

        // ALWAYS redirect to /trips/:id (fetch from DB, no stale sessionStorage)
        // The backend saves the trip via FinalizeAndSaveToDB
        if (data.trip?.id) {
            // Store ID if anonymous (Preview-First Flow)
            if (!isSignedIn) {
                localStorage.setItem('pending_trip_id', data.trip.id);
            }
            router.push(`/trips/${data.trip.id}`);
        } else {
            // Fallback: if no trip ID, go home
            console.error("No trip ID in response:", data);
            router.push('/');
        }
    };

    // --- HELPER VARS ---
    const showHeader = !isLoading;

    // --- RENDER: DISCOVERY / HERO MODE ---
    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white px-4 py-8 md:px-8 max-w-7xl mx-auto flex flex-col relative overflow-hidden">
            <Navbar />

            {/* Modal Planner */}
            <TripPlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                initialDestination={plannerDestination} // Pass kota sesuai flow
                onTripGenerated={handleTripGenerated}
            />

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-20 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />

            {/* HEADER AREA */}
            <div className="py-24 md:py-36 flex flex-col items-center justify-center space-y-8">

                {/* 1. Logo & Headline */}
                <HeroHeader isCompact={false} />

                {/* 2. Main Action Area */}
                <div className="w-full transition-all duration-700 max-w-xl">

                    {/* Search Bar (Primary Action) */}
                    <SearchBar
                        city={searchCity}
                        setCity={setSearchCity}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        isCompact={false}
                    />

                    {/* Subtle Inspiration Path */}
                    {!isLoading && (
                        <div className="mt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 delay-200">
                            <p className="text-slate-400 text-sm font-medium">
                                Not sure where to go? {' '}
                                <button
                                    onClick={handleSurpriseMe}
                                    className="text-teal-600 hover:text-teal-700 font-bold hover:underline transition-all"
                                >
                                    Surprise me ✨
                                </button>
                            </p>

                            <div className="mt-8">
                                <SuggestionChips onSelect={handleChipSelect} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TRIP RESULT MODE (FULL SCREEN) */}
            <div className="flex-1 w-full relative z-10" />
        </main>
    );
}
