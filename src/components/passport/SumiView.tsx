'use client';

import { useState } from "react";
import { PassportStamp } from "./PassportStamp";
import { StampReveal } from "./StampReveal";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import { Stamp as StampIcon } from "lucide-react";

// Mock Data for Development
const MOCK_STAMPS = [
    {
        id: "stamp-01",
        city: "Tokyo",
        date: "FEB 13 2026",
        serial: "NRT-0813-M",
        mood: "morning",
        image: "/stamps/tokyo-morning.png",
        rotation: 1.2
    },
    {
        id: "stamp-02",
        city: "Tokyo",
        date: "MAR 02 2026",
        serial: "HND-2023-R",
        mood: "rain",
        image: "/stamps/tokyo-rain.png",
        rotation: -2.5
    },
    {
        id: "stamp-03",
        city: "New York",
        date: "APR 15 2026",
        serial: "JFK-9921-N",
        mood: "night",
        image: "/stamps/tokyo-night.png", // Reusing Tokyo night for NY demo
        rotation: 0.5
    }
];

export function SumiView() {
    const [isRevealOpen, setIsRevealOpen] = useState(false);
    const [activeMood, setActiveMood] = useState<"morning" | "rain" | "night">("morning");

    // Helper to get image for reveal demo based on active mood
    const getRevealImage = () => {
        switch (activeMood) {
            case "rain": return "/stamps/tokyo-rain.png";
            case "night": return "/stamps/tokyo-night.png";
            default: return "/stamps/tokyo-morning.png";
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Unified Page Header with Leather/Paper Texture Hint */}
            <PageHeader
                title="Sumi Collection"
                subtitle="Your Living Travel Ink"
                className="bg-stone-900 border-b border-stone-800"
                rightElement={
                    <div className="flex items-center gap-3">
                        {/* Dev Controls for Demo */}
                        <div className="hidden md:flex bg-white/10 backdrop-blur-md rounded-lg p-1 border border-white/10">
                            {(["morning", "rain", "night"] as const).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setActiveMood(m)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeMood === m ? "bg-stone-700 text-stone-200" : "text-stone-400 hover:text-white"
                                        }`}
                                >
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setIsRevealOpen(true)}
                            className="bg-stone-700 hover:bg-stone-600 text-white shadow-lg shadow-stone-900/20 border border-stone-600"
                        >
                            Simulate Arrival
                        </Button>
                    </div>
                }
            />

            <div className="px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Passport Grid Container */}
                <div className="relative w-full aspect-[4/3] max-w-5xl mx-auto bg-[#F5F1E8] rounded-[2rem] shadow-2xl overflow-hidden border border-[#E2D9C8]">
                    {/* Background Texture - Paper */}
                    <div className="absolute inset-0 opacity-60 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />

                    {/* Ink Bleed Overlay Check */}
                    <div className="absolute inset-0 z-0 bg-stone-100/10 mix-blend-multiply pointer-events-none" />

                    {/* Stamps Grid */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-8 p-8 md:p-12">

                        {MOCK_STAMPS.map((stamp) => (
                            <div key={stamp.id} className="relative group mix-blend-multiply opacity-90 hover:opacity-100 transition-opacity duration-500">
                                <PassportStamp
                                    imageSrc={stamp.image}
                                    city={stamp.city}
                                    date={stamp.date}
                                    serialCode={stamp.serial}
                                    rotation={stamp.rotation}
                                />
                            </div>
                        ))}

                        {/* Empty Slot Placeholder - Onboarding Context */}
                        <div className="col-span-1 md:col-span-1 border-2 border-dashed border-stone-300 rounded-full aspect-square flex flex-col items-center justify-center p-6 text-center opacity-60 hover:opacity-100 transition-all group bg-white/20">
                            <div className="w-12 h-12 rounded-full bg-stone-200/50 flex items-center justify-center mb-3 group-hover:bg-stone-200 group-hover:text-stone-700 transition-colors">
                                <StampIcon className="w-6 h-6 text-stone-400" />
                            </div>
                            <h3 className="text-stone-800 font-bold text-sm mb-1">Collect Moments</h3>
                            <p className="text-stone-500 font-serif text-xs italic">"Sumi captures the soul of your journey..."</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Reveal Modal */}
            <StampReveal
                isOpen={isRevealOpen}
                onClose={() => setIsRevealOpen(false)}
                city="Tokyo"
                mood={activeMood}
                stampImage={getRevealImage()}
            />

        </div>
    );
}
