'use client';

import React, { useState } from 'react';
import { Sparkles, Map, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DiscoveryView from '@/components/business/discovery/DiscoveryView';
import DiscoveryLoading from '@/components/business/discovery/DiscoveryLoading';
import HeroHeader from '@/components/business/discovery/HeroHeader';
import SearchBar from '@/components/business/discovery/SearchBar';
import SuggestionChips from '@/components/business/discovery/SuggestionChips';
import TripPlannerModal from '@/components/business/create-trip/TripPlannerModal';
import TripResult from '@/components/business/TripResult';
import { useDiscovery } from '@/hooks/useDiscovery';
import { TripResponse } from '@/types';
import Navbar from '@/components/layout/Navbar';

export default function HomePage() {
    // --- HOOKS & STATES ---
    const {
        searchCity,
        setSearchCity,
        isLoading,
        discoveryData,
        heroImage,
        performSearch
    } = useDiscovery();

    // State untuk Modal & Trip Result
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);
    const [generatedTrip, setGeneratedTrip] = useState<TripResponse | null>(null);

    // State baru: Menentukan kota apa yang dikirim ke Form
    // Jika kosong = User mengetik sendiri di form (Direct Flow)
    // Jika terisi = Auto-fill dari Discovery (Discovery Flow)
    const [plannerDestination, setPlannerDestination] = useState('');

    // --- HANDLERS ---

    // 1. Search Handler (Discovery Flow)
    const handleSearch = () => {
        setGeneratedTrip(null);
        performSearch(searchCity);
    };

    const handleChipSelect = (city: string) => {
        setGeneratedTrip(null);
        setSearchCity(city);
        performSearch(city);
    };

    // 2. Plan Handler (Triggered from Discovery View)
    const handlePlanFromDiscovery = () => {
        setPlannerDestination(discoveryData?.city || '');
        setIsPlannerOpen(true);
    };

    // 3. Direct Plan Handler (Triggered from Hero Section)
    const handleDirectPlan = () => {
        setPlannerDestination(''); // Kosongkan agar user isi sendiri
        setIsPlannerOpen(true);
    };

    // 4. Trip Generated Handler (Callback from Modal)
    const handleTripGenerated = (data: TripResponse) => {
        setGeneratedTrip(data);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- HELPER VARS ---
    const isResultMode = !!discoveryData;
    const isTripMode = !!generatedTrip;

    // --- RENDER: TRIP RESULT MODE (PREVIEW) ---
    if (isTripMode && generatedTrip) {
        return (
            <main className="min-h-screen bg-slate-50 relative">
                {!isTripMode && <Navbar />}

                {/* Floating Nav untuk Back */}
                <nav className="fixed top-6 left-6 z-50">
                    <button
                        onClick={() => setGeneratedTrip(null)}
                        className="group flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-slate-600 text-sm font-bold border border-white/50 hover:bg-white hover:scale-105 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Search
                    </button>
                </nav>

                <TripResult data={generatedTrip} isSavedView={false} />
            </main>
        );
    }

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

            {/* Loading Overlay */}
            {isLoading && <DiscoveryLoading city={searchCity} />}

            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-teal-50/50 to-transparent -z-10 pointer-events-none" />
            <div className="absolute top-20 right-0 w-64 h-64 bg-blue-100/30 rounded-full blur-3xl -z-10 animate-pulse pointer-events-none" />

            {/* HEADER AREA */}
            <div className={`transition-all duration-700 ease-out w-full ${isResultMode ? 'py-6 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 mb-8' : 'py-24 md:py-36 flex flex-col items-center justify-center space-y-8'}`}>

                {/* 1. Logo & Headline */}
                <HeroHeader isCompact={isResultMode} />

                {/* 2. Main Action Area */}
                <div className={`w-full transition-all duration-700 ${isResultMode ? 'md:max-w-md' : 'max-w-xl'}`}>

                    {/* Search Bar (Primary Action) */}
                    <SearchBar
                        city={searchCity}
                        setCity={setSearchCity}
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        isCompact={isResultMode}
                    />

                    {/* DIRECT PLANNING CTA (Hanya muncul saat belum ada hasil search) */}
                    {!isResultMode && !isLoading && (
                        <div className="mt-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 delay-200">

                            {/* Stylish "OR" Divider */}
                            <div className="flex items-center gap-4 w-full justify-center mb-6">
                                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-slate-200"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white px-2">or</span>
                                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-slate-200"></div>
                            </div>

                            {/* Secondary Action: Direct Plan */}
                            <div className="text-center space-y-3">
                                <p className="text-slate-500 text-sm font-medium">
                                    Already know your destination?
                                </p>
                                <Button
                                    onClick={handleDirectPlan}
                                    className="group relative overflow-hidden bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md transition-all px-8 py-6 h-auto rounded-xl"
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="p-2 bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                                            <Sparkles className="w-5 h-5 text-teal-600" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-base">Skip Discovery</div>
                                            <div className="text-xs text-slate-400 font-normal">Create itinerary directly</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 group-hover:translate-x-1 transition-all ml-2" />
                                    </div>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SUGGESTION CHIPS (Hanya muncul saat idle) */}
            {!isResultMode && !isLoading && (
                <div className="mt-4">
                    <SuggestionChips onSelect={handleChipSelect} />
                </div>
            )}

            {/* RESULT VIEW (DISCOVERY) */}
            <div className="flex-1 w-full relative z-10">
                {discoveryData && (
                    <DiscoveryView
                        data={discoveryData}
                        onPlanTrip={handlePlanFromDiscovery} // Menggunakan handler khusus discovery
                        heroImage={heroImage}
                    />
                )}
            </div>
        </main>
    );
}