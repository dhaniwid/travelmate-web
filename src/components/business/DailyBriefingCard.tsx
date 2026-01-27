import {Sun, CloudRain, Shirt, Sparkles} from "lucide-react";
import {MorningBriefing} from "@/types";

export default function DailyBriefingCard({briefing}: { briefing: MorningBriefing }) {
    if (!briefing) return null;

    // Simple Icon Logic
    const WeatherIcon = briefing.weather_forecast.toLowerCase().includes("rain") ? CloudRain : Sun;

    return (
        <div
            className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-5 shadow-sm">
            {/* Header Kecil */}
            <div className="flex items-center gap-2 mb-3">
                <div className="bg-white p-1.5 rounded-full shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-500"/>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Daily Context
                </span>
            </div>

            {/* Grid Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weather */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/60 p-2 rounded-xl">
                        <WeatherIcon className="w-5 h-5 text-blue-500"/>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Forecast</p>
                        <p className="text-sm font-semibold text-slate-700">{briefing.weather_forecast}</p>
                    </div>
                </div>

                {/* Outfit */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/60 p-2 rounded-xl">
                        <Shirt className="w-5 h-5 text-purple-500"/>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Outfit Tip</p>
                        <p className="text-sm font-semibold text-slate-700">{briefing.outfit_tip}</p>
                    </div>
                </div>

                {/* Vibe */}
                <div className="flex items-center gap-3">
                    <div className="bg-white/60 p-2 rounded-xl">
                        <span className="text-lg">✨</span>
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Today's Vibe</p>
                        <p className="text-sm font-semibold text-slate-700">{briefing.local_vibe}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}