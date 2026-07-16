import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Plane, Train, Car, Clock, MapPin,
    Navigation, ArrowRight, AlertTriangle,
    CircleDot, Hotel, Quote
} from 'lucide-react';
import { TripResponse } from '@/types';
import { cn } from '@/lib/utils';

// Helper Warna Badge Strategy
const getStrategyColor = (tag: string) => {
    switch (tag?.toUpperCase()) {
        case 'HEMAT': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'CEPAT': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'NYAMAN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
};

// Helper Price Tier
const renderPriceTier = (tier: string) => {
    const activeColor = "text-emerald-400";
    const inactiveColor = "text-slate-700";

    let level = 1;
    if (tier === 'MED') level = 2;
    if (tier === 'HIGH') level = 3;

    return (
        <div className="flex gap-0.5 text-[10px] font-bold tracking-tighter" title={`Price Tier: ${tier}`}>
            <span className={level >= 1 ? activeColor : inactiveColor}>$</span>
            <span className={level >= 2 ? activeColor : inactiveColor}>$</span>
            <span className={level >= 3 ? activeColor : inactiveColor}>$</span>
        </div>
    );
};

export default function LogisticsCard({ plan }: { plan: TripResponse['plan'] }) {
    const { transport_options, strategic_accommodation } = plan;
    const logistics_context = (plan as any).logistics_context;

    return (
        <Card className="border-0 shadow-xl bg-slate-900 text-white overflow-hidden sticky top-24 ring-1 ring-white/10">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 p-40 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <CardHeader className="pb-4 relative z-10 border-b border-white/5">
                <CardTitle className="flex items-center justify-between text-lg font-bold">
                    <div className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-blue-400" />
                        Logistics Strategy
                    </div>
                    {logistics_context?.distance_km && (
                        <Badge variant="secondary" className="bg-white/5 text-slate-400 text-[10px] font-mono border-0">
                            ~{logistics_context.distance_km} km
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6 relative z-10">

                {/* --- 0. CONTEXT WARNING (Jika Ada) --- */}
                {logistics_context?.warning_alert && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex gap-3 items-start">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-200/90 leading-relaxed">
                            {logistics_context.warning_alert}
                        </p>
                    </div>
                )}

                {/* --- 1. TRANSPORT STRATEGIES --- */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Plane className="w-3 h-3" /> Transport Options
                    </h4>

                    {transport_options?.map((opt: any, idx: number) => (
                        <div key={idx} className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-blue-500/30 rounded-xl p-4 transition-all duration-300">

                            {/* Header Section */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border font-semibold", getStrategyColor(opt.strategy_tag))}>
                                            {opt.strategy_tag}
                                        </Badge>
                                        {/* Field Baru: total_duration_display */}
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {opt.total_duration_display}
            </span>
                                    </div>
                                    <h5 className="text-sm font-bold text-slate-200">{opt.name}</h5>

                                    {/* FITUR BARU: Operators Hint */}
                                    {opt.operators_hint && (
                                        <p className="text-[10px] text-slate-500 mt-1">
                                            <span className="font-semibold text-slate-400">Operators:</span> {opt.operators_hint}
                                        </p>
                                    )}
                                </div>
                                {renderPriceTier(opt.price_tier)}
                            </div>

                            {/* Booking Button (Optional Feature Idea) */}
                            {/* <a href={`https://www.google.com/search?q=${encodeURIComponent(opt.booking_query)}`}
                                  target="_blank"
                                  className="text-[10px] text-blue-400 hover:underline mt-2 block"
                                >
                                  Check Availability &rarr;
                                </a>
                                */}

                            {/* Hub Details (From -> To) */}
                            {opt.hub_details && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mb-3 bg-black/20 p-1.5 rounded-md w-fit">
                                    <span>{opt.hub_details.departure_node}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-600" />
                                    <span>{opt.hub_details.arrival_node}</span>
                                </div>
                            )}

                            {/* Journey Breakdown (The 3 Steps) */}
                            {opt.breakdown && (
                                <div className="space-y-2 relative pl-2 border-l border-white/10 my-3">
                                    <StepItem label="Start" text={opt.breakdown.first_mile} />
                                    <StepItem label="Main" text={opt.breakdown.main_leg} highlight />
                                    <StepItem label="End" text={opt.breakdown.last_mile} />
                                </div>
                            )}

                            {/* Pros */}
                            <p className="text-[11px] text-slate-400 italic mt-2 border-t border-white/5 pt-2">
                                "{opt.pros}"
                            </p>
                        </div>
                    ))}
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* --- 2. ACCOMMODATION STRATEGY --- */}
                <div className="space-y-4">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <Hotel className="w-3 h-3" /> Strategic Stay Areas
                    </h4>

                    {strategic_accommodation?.map((opt: any, idx: number) => (
                        <div key={idx}
                             className="bg-white/5 hover:bg-white/10 border border-white/5 hover:border-teal-500/30 rounded-xl p-4 transition-all duration-300">
                            <div className="flex justify-between items-start mb-2">
                                <h5 className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5"/>
                                    {opt.area_name} {/* Updated Field */}
                                </h5>
                                <Badge variant="secondary"
                                       className="bg-slate-800 text-slate-400 text-[10px] h-5 px-1.5">
                                    {opt.type}
                                </Badge>
                            </div>

                            <div className="flex gap-2 items-start mb-2">
                                <Quote className="w-3 h-3 text-slate-600 shrink-0 mt-0.5 rotate-180"/>
                                <p className="text-xs text-slate-300 font-medium">
                                    {opt.reason}
                                </p>
                            </div>

                            <p className="text-[11px] text-slate-500 leading-snug">
                                {opt.vibe} {/* Updated Field */}
                            </p>
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}

// Mini Component untuk Breakdown Steps
function StepItem({label, text, highlight = false}: { label: string, text: string, highlight?: boolean }) {
    return (
        <div className="flex items-start gap-2 relative">
            <div
                className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", highlight ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-slate-700")}/>
            <div className="flex flex-col">
                {/* <span className="text-[9px] text-slate-600 uppercase font-bold tracking-wider">{label}</span> */}
                <span className={cn("text-[11px] leading-tight", highlight ? "text-slate-200 font-medium" : "text-slate-400")}>
                    {text}
                </span>
            </div>
        </div>
    );
}