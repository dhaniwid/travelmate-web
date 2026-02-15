'use client';

import React from 'react';
import AccommodationCard from '@/components/business/trip-result/AccommodationCard';
import PackingListWidget from '@/components/business/trip-result/PackingListWidget';
import { Trip, TripPlan } from '@/types';
import {
    Bed,
    Package,
    Plane,
    Train,
    Wallet,
    Clock,
    ShieldCheck,
    ExternalLink,
    ArrowRight,
    CreditCard,
    Info,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFlightSearchLink } from '@/utils/booking';
import EmptyState from '@/components/ui/EmptyState';

interface EssentialsViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function EssentialsView({ trip, plan }: EssentialsViewProps) {
    const arrival = plan.arrival_guide || plan.logistics?.arrival_guide || {
        primary_transport: 'Flight',
        travel_time: 'TBD',
        estimated_price_range: '',
        visa_info: 'Check local requirements'
    };

    const TransportIcon = arrival.primary_transport.toLowerCase().includes('train') ? Train : Plane;
    const breakdown = plan.budget_breakdown;

    const formatCurrency = (val: any) => {
        let num = typeof val === 'number' ? val : (parseInt(val) || 0);
        if (num > 0 && num < 5000) num *= 15500; // Mock conversion
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(num);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'TBD';
        try {
            const date = new Date(dateStr);
            return new Intl.DateTimeFormat('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }).format(date);
        } catch (e) {
            return dateStr;
        }
    };

    const totalBudget = React.useMemo(() => {
        if (!breakdown) return 0;
        return Object.values(breakdown).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
    }, [breakdown]);

    return (
        <div className="space-y-20 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

            {/* 1. Arrival Guide & Visa */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-teal-500 rounded-full" />
                        Arrival Guide
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Essential info for your landing in {trip.destination}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Transport Card */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                                    <TransportIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Primary Transport</h4>
                                    <p className="text-2xl font-black text-slate-900 tracking-tight">{arrival.primary_transport}</p>
                                </div>
                            </div>
                            <a
                                href={getFlightSearchLink(trip.origin, trip.destination, trip.start_date)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-[1.2rem] font-black text-sm transition-all shadow-xl shadow-teal-100 group"
                            >
                                Book Journey
                                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </a>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-50">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Travel Time</span>
                                </div>
                                <p className="text-lg font-black text-slate-900">{arrival.travel_time}</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Safety Tier</span>
                                </div>
                                <p className="text-lg font-black text-slate-900">Secure Route</p>
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-teal-500">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visa Info</span>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-tight">{arrival.visa_info || 'Visa on Arrival / E-Visa available'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Flight Path Card */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent)] pointer-events-none" />
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/60 mb-6">Route Summary</h4>
                            <div className="flex items-center gap-4 text-xl font-black tracking-tighter">
                                <span>{trip.origin}</span>
                                <ArrowRight className="w-5 h-5 text-teal-400" />
                                <span>{trip.destination}</span>
                            </div>
                        </div>
                        <div className="relative z-10 mt-8 space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Departure</p>
                                <p className="text-lg font-black">{formatDate(trip.start_date)}</p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Trip Duration</p>
                                <p className="text-lg font-black">{trip.trip_days} Days</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Strategic Stays */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-orange-500 rounded-full" />
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

            {/* 3. Budget Analytics */}
            <section>
                <div className="mb-10">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-indigo-600 rounded-full" />
                        Budget Breakdown
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Estimated expenses based on your {trip.style} style</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Transport', icon: Plane, amount: breakdown?.transport, color: 'bg-teal-500' },
                            { label: 'Accommodation', icon: Bed, amount: breakdown?.accommodation, color: 'bg-indigo-500' },
                            { label: 'Food & Dining', icon: Wallet, amount: breakdown?.food, color: 'bg-amber-500' },
                            { label: 'Activities & Tickets', icon: CreditCard, amount: breakdown?.tickets, color: 'bg-rose-500' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", item.color)}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <span className="font-bold text-slate-700">{item.label}</span>
                                </div>
                                <span className="font-black text-slate-900">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="bg-indigo-50 rounded-[2.5rem] p-8 border border-indigo-100 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                            <Wallet className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-1">Total Estimated</p>
                            <p className="text-3xl font-black text-indigo-900 tracking-tighter">
                                {formatCurrency(totalBudget || trip.budget)}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Packing Essentials */}
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
