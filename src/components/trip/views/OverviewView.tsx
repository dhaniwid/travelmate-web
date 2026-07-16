'use client';

import React from 'react';
import HighlightsRow from '@/components/business/trip-result/HighlightsRow';
import DiscoverySection from '@/components/business/trip-result/DiscoverySection';
import { Trip, TripPlan } from '@/types';
import { Sparkles } from 'lucide-react';

interface OverviewViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function OverviewView({ trip, plan }: OverviewViewProps) {
    // Fallback: If no highlights, use top activities from itinerary
    const highlights = React.useMemo(() => {
        if (plan.highlights && plan.highlights.length > 0) return plan.highlights;

        // Take first activity of each of the first 3 days
        const fallback = (plan.itinerary || [])
            .slice(0, 3)
            .map(day => (day.activities || [])[0])
            .filter(Boolean)
            .map(act => ({
                title: act.place_name || act.activity,
                type: act.type ?? 'Activity',
                hook: act.description,
                image_prompt: `High-quality cinematic photo of ${act.place_name || act.activity} in ${trip.destination}`,
            }));

        return fallback;
    }, [plan.highlights, plan.itinerary]);

    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* 1. Morning Briefing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-12 relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-teal-400 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shrink-0">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-black text-teal-600 uppercase tracking-[0.3em] mb-2">Briefing Perjalanan</h3>
                                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                                            {plan.tagline || `Adventure in ${trip.destination}`}
                                        </h2>
                                    </div>

                                    {plan.vibes && plan.vibes.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {plan.vibes.map((vibe, idx) => (
                                                <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                                    {vibe}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-xl text-slate-600 leading-relaxed max-w-4xl font-medium">
                                {plan.morning_briefing || `Ready for your adventure in ${trip.destination || 'Unknown'}? Today's vibe is exploration. We've optimized your transport routes and selected the best starting points.`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. Must Visit Spots */}
                <div className="lg:col-span-12 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 mb-1">Pilihan Editor</h3>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Wajib Dikunjungi</h2>
                        </div>
                    </div>
                    <HighlightsRow highlights={highlights} destination={trip.destination} />
                </div>

                {/* 3. Discovery & DNA */}
                <div className="lg:col-span-12">
                    <DiscoverySection
                        culinary={plan.culinary_signature}
                        history={plan.history_snippet}
                        destination={trip.destination}
                    />
                </div>
            </div>
        </div>
    );
}
