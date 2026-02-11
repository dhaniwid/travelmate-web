'use client';

import React from 'react';
import { Trip, TripPlan } from '@/types';
import {
    Plane,
    Train,
    Wallet,
    ArrowRight,
    ExternalLink,
    ShieldCheck,
    CreditCard,
    Clock,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFlightSearchLink } from '@/utils/booking';

interface LogisticsViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function LogisticsView({ trip, plan }: LogisticsViewProps) {
    const arrival = plan.arrival_guide || {
        primary_transport: 'Flight',
        travel_time: 'TBD',
        estimated_price_range: ''
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Arrival Guide */}
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-teal-500 rounded-full" />
                        Arrival Guide
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
                                <TransportIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Primary Transport</h4>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{arrival.primary_transport}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-bold">Travel Time</span>
                                </div>
                                <span className="text-sm font-black text-slate-900">{arrival.travel_time}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3 text-slate-500">
                                    <ShieldCheck className="w-4 h-4 text-teal-500" />
                                    <span className="text-sm font-bold">Route Comfort</span>
                                </div>
                                <span className="text-sm font-black text-slate-900 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-[10px] uppercase">Highly Rated</span>
                            </div>
                        </div>

                        <a
                            href={getFlightSearchLink(trip.origin, trip.destination, trip.start_date)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-[1.5rem] font-black text-sm transition-all shadow-xl shadow-teal-100 group"
                        >
                            Book Your Journey
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </a>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                        {/* Mesh Gradient Overlay */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent)] pointer-events-none" />

                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/60 mb-8">Origin to Destination</h4>
                                <div className="flex items-center gap-6 text-3xl font-black tracking-tighter">
                                    <span className="drop-shadow-md">{trip.origin}</span>
                                    <div className="flex items-center">
                                        <div className="w-8 h-1 bg-teal-500/30 rounded-full" />
                                        <ArrowRight className="w-8 h-8 text-teal-400 -mx-1 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]" />
                                        <div className="w-8 h-1 bg-teal-500/30 rounded-full" />
                                    </div>
                                    <span className="drop-shadow-md">{trip.destination}</span>
                                </div>
                            </div>

                            <div className="mt-16 flex justify-between items-end border-t border-white/5 pt-8">
                                <div>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Est. Departure</p>
                                    <p className="text-xl font-black tracking-tight">{formatDate(trip.start_date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-2">Duration</p>
                                    <p className="text-xl font-black tracking-tight">{trip.trip_days} Days</p>
                                </div>
                            </div>
                        </div>

                        {/* Background Watermark Icon */}
                        <div className="absolute -top-12 -right-12 opacity-[0.03] rotate-12 transition-transform duration-1000 hover:scale-110">
                            <TransportIcon className="w-80 h-80" />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Budget Breakdown */}
            <section>
                <div className="mb-8">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2.5 h-10 bg-slate-900 rounded-full" />
                        Budget Analytics
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-4">
                        {[
                            { label: 'Transport', icon: Plane, amount: breakdown?.transport, color: 'bg-teal-500' },
                            { label: 'Accommodation', icon: ShieldCheck, amount: breakdown?.accommodation, color: 'bg-indigo-500' },
                            { label: 'Food & Dining', icon: Wallet, amount: breakdown?.food, color: 'bg-amber-500' },
                            { label: 'Activities & Tickets', icon: CreditCard, amount: breakdown?.tickets, color: 'bg-teal-600' },
                            { label: 'Miscellaneous', icon: Info, amount: breakdown?.misc, color: 'bg-slate-500' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm group hover:border-teal-100 hover:shadow-md transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110", item.color)}>
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <span className="font-extrabold text-slate-700 tracking-tight">{item.label}</span>
                                </div>
                                <div className="text-right">
                                    <span className="font-black text-xl text-slate-900 tracking-tighter">
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-xl flex flex-col items-center justify-center text-center space-y-6">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500 rounded-full blur-[80px] opacity-20" />

                        <div className="w-20 h-20 rounded-3xl bg-teal-500 flex items-center justify-center text-white shadow-2xl shadow-teal-500/20 rotate-3 transition-transform hover:rotate-0">
                            <Wallet className="w-10 h-10" />
                        </div>

                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 mb-2">Total Estimated Budget</p>
                            <p className="text-4xl font-black tracking-tighter text-white">
                                {formatCurrency(totalBudget || trip.budget || plan.total)}
                            </p>
                        </div>

                        <div className="pt-6 border-t border-white/10 w-full">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                                Curated for your <span className="text-teal-400">{trip.style}</span> lifestyle
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

