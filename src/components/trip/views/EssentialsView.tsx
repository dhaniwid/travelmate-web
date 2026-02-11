'use client';

import React from 'react';
import AccommodationCard from '@/components/business/trip-result/AccommodationCard';
import PackingListWidget from '@/components/business/trip-result/PackingListWidget';
import { Trip, TripPlan } from '@/types';
import { Bed, Package } from 'lucide-react';

interface EssentialsViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function EssentialsView({ trip, plan }: EssentialsViewProps) {
    return (
        <div className="space-y-16 animate-in fade-in duration-300">
            {/* 1. Strategic Stays */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-orange-500 rounded-full" />
                        Strategic Stays
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Top-rated neighborhoods optimized for your itinerary</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {plan.strategic_accommodation?.length > 0 ? (
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
                        <div className="col-span-2 p-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-bold">
                            No accommodation suggestions yet. Check back after finalizing your trip!
                        </div>
                    )}
                </div>
            </section>

            {/* 2. Packing List */}
            <section>
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                            Packing Essentials
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">Curated checklist for {trip.destination}</p>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <PackingListWidget packingList={plan.packing_list || []} className="bg-white rounded-2xl p-4 md:p-8" />
                </div>
            </section>
        </div>
    );
}
