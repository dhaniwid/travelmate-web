import { useState } from "react";
import { PassportStamp } from "./PassportStamp";
import { StampReveal } from "./StampReveal";
import { Button } from "@/components/ui/button";
import { Settings2 } from "lucide-react";

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

export function PassportView() {
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
        <div className="w-full min-h-[600px] p-6 md:p-10 space-y-8 bg-[#F8FAFC]">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">My Passport</h2>
                    <p className="text-slate-500 mt-1">Digital collectibles from your journeys</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Dev Controls for Demo */}
                    <div className="flex bg-white/50 rounded-lg p-1 border border-slate-200">
                        {(["morning", "rain", "night"] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setActiveMood(m)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${activeMood === m ? "bg-teal-100 text-teal-800" : "text-slate-500 hover:text-slate-700"
                                    }`}
                            >
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={() => setIsRevealOpen(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-900/20"
                    >
                        Simulate Arrival
                    </Button>
                </div>
            </div>

            {/* Passport Grid Container */}
            <div className="relative w-full aspect-[4/3] max-w-5xl mx-auto bg-[#F5F1E8] rounded-2xl shadow-xl overflow-hidden border border-[#E2D9C8]">
                {/* Background Texture */}
                <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />

                {/* Grid Line Pattern (Optional Passport Page Look) */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(13,148,136,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* Stamps Grid */}
                <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 p-12">

                    {MOCK_STAMPS.map((stamp) => (
                        <PassportStamp
                            key={stamp.id}
                            imageSrc={stamp.image}
                            city={stamp.city}
                            date={stamp.date}
                            serialCode={stamp.serial}
                            rotation={stamp.rotation}
                        />
                    ))}

                    {/* Empty Slot Placeholder */}
                    <div className="border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center aspect-square opacity-50">
                        <span className="text-slate-400 font-mono text-sm">Open Slot</span>
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
