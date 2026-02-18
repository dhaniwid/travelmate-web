'use client';

import React from 'react';
import AccommodationCard from '@/components/business/trip-result/AccommodationCard';
import PackingListWidget from '@/components/business/trip-result/PackingListWidget';
import { Trip, TripPlan } from '@/types';
import {
    Bed,
    Package,
} from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';

interface EssentialsViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function EssentialsView({ trip, plan }: EssentialsViewProps) {
    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* 1. Strategic Stays */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-orange-500 rounded-full" />
                        Strategic Stays
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Top-rated neighborhoods optimized for your itinerary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plan.strategic_accommodation && plan.strategic_accommodation.length > 0 ? (
                        plan.strategic_accommodation.map((opt, i) => (
                            <AccommodationCard
                                key={i}
                                option={opt}
                                tripContext={{
                                    destination: trip.destination,
                                    startDate: trip.start_date,
                                    days: trip.trip_days
                                }}
                            />
                        ))
                    ) : (
                        <div className="col-span-2">
                            <EmptyState
                                icon={Bed}
                                title="No stays suggested yet"
                                description="We're scouting for the best neighborhoods that fit your itinerary. Check back shortly!"
                                className="bg-slate-50 border-slate-200"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* 2. Packing Essentials */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-slate-900 rounded-full" />
                        Packing Checklist
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Curated checklist for {trip.destination}</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <PackingListWidget packingList={plan.packing_list || []} className="p-4 md:p-8" />
                </div>
            </section>
        </div>
    );
}
