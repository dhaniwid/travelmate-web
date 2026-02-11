'use client';

import React from 'react';
import HighlightsRow from '@/components/business/trip-result/HighlightsRow';
import LogisticsDashboard from '@/components/business/trip-result/LogisticsDashboard';
import DiscoverySection from '@/components/business/trip-result/DiscoverySection';
import { Trip, TripPlan } from '@/types';
import { Sparkles, Info } from 'lucide-react';

interface OverviewViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function OverviewView({ trip, plan }: OverviewViewProps) {
    return (
        <div className="space-y-12 animate-in fade-in duration-300 pb-20">
            {/* 1. The Big Header / Morning Briefing */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-600 to-teal-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-10 border border-slate-100 shadow-xl overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />

                    <div className="relative flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-16 h-16 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-xl shrink-0">
                            <Sparkles className="w-8 h-8" />
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-black text-teal-600 uppercase tracking-widest mb-1">Morning Briefing</h3>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                                    {plan.tagline || `Adventure in ${trip.destination}`}
                                </h2>
                                {/* Vibes */}
                                {plan.vibes && plan.vibes.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {plan.vibes.map((vibe, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                                                {vibe}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl font-medium">
                                {plan.morning_briefing || `Ready for your adventure in ${trip.destination || 'Unknown'}? Today's vibe is exploration. We've optimized your transport routes and selected the best starting points.`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Editorial Discovery Content */}
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <span className="h-px flex-1 bg-slate-100"></span>
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Destination DNA</h2>
                    <span className="h-px flex-1 bg-slate-100"></span>
                </div>
                <DiscoverySection
                    culinary={plan.culinary_signature}
                    hiddenGem={plan.hidden_gem}
                    history={plan.history_snippet}
                />
            </section>

            {/* 3. Logistics Summary (Stats Bar) */}
            <section className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
                        <Info className="w-4 h-4 text-teal-500" />
                        Travel Essentials
                    </h3>
                </div>
                <LogisticsDashboard trip={trip} plan={plan} />
            </section>

            {/* 4. Highlights */}
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-teal-500 rounded-full" />
                        Must Visit Spots
                    </h2>
                </div>
                <HighlightsRow highlights={plan.highlights} destination={trip.destination} />
            </section>
        </div>
    );
}
