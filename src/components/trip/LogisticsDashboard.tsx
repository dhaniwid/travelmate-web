'use client';

import React from 'react';
import { Trip, TripPlan } from '@/types';
import { Plane, Train, Bus, Car, CreditCard, Tag, ArrowRight, Info, Clock, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/format';

interface LogisticsDashboardProps {
    trip: Trip;
    plan: TripPlan;
}

const getTransportIcon = (type: string) => {
    switch (type?.toLowerCase()) {
        case 'plane': return Plane;
        case 'train': return Train;
        case 'bus': return Bus;
        case 'car': return Car;
        default: return Info;
    }
};

export default function LogisticsDashboard({ trip, plan }: LogisticsDashboardProps) {
    const { arrival_guide, budget_breakdown } = plan;

    const totalCost = plan.total || (
        (budget_breakdown?.transport || 0) +
        (budget_breakdown?.accommodation || 0) +
        (budget_breakdown?.food || 0) +
        (budget_breakdown?.tickets || 0) +
        (budget_breakdown?.misc || 0)
    );

    const TransportIcon = getTransportIcon(arrival_guide?.primary_transport || '');

    return (
        <div className="relative z-10 -mt-8 md:-mt-12 mb-8 px-4 md:px-0">
            <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.12)] rounded-[2.5rem] overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 divide-x divide-y md:divide-y-0 divide-slate-100">

                    {/* 1. Arrival Guide */}
                    <div className="p-4 md:p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                            <TransportIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arrival</span>
                        </div>
                        {arrival_guide ? (
                            <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-sm md:text-base font-bold text-slate-900">
                                    <span className="truncate">{trip.origin}</span>
                                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                                    <span className="truncate">{trip.destination}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-tight">
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {arrival_guide.travel_time}</span>
                                    <span>•</span>
                                    <span className="text-blue-600">{arrival_guide.primary_transport}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-xs text-slate-400 font-medium italic">Transport details TBD</div>
                        )}
                    </div>

                    {/* 2. Budget Estimate */}
                    <div className="p-4 md:p-6 flex flex-col justify-center bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Budget</span>
                        </div>
                        <div className="space-y-0.5">
                            <div className="text-lg md:text-xl font-black text-slate-900">
                                {formatCurrency(totalCost)}
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {trip.budget_range || 'Moderate'} Pace
                            </div>
                        </div>
                    </div>

                    {/* 3. Trip Context (Full span on mobile) */}
                    <div className="p-4 md:p-6 col-span-2 md:col-span-1 flex flex-col justify-center border-t md:border-t-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Context</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {trip.style?.split(',').slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                    {tag.trim()}
                                </span>
                            ))}
                            {trip.user_preferences?.pace && (
                                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {trip.user_preferences.pace}
                                </span>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
