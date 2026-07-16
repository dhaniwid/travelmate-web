import React from 'react';
import { Trip, TripPlan } from '@/types';
import { Plane, Train, Wallet, Compass, Ticket, ArrowRight, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFlightSearchLink } from '@/utils/booking';

interface LogisticsDashboardProps {
    trip: Trip;
    plan: TripPlan;
}

export default function LogisticsDashboard({ trip, plan }: LogisticsDashboardProps) {
    if (!trip || !plan) {
        return (
            <div className="-mt-20 relative z-20 mx-4 md:mx-auto max-w-4xl bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 flex justify-center items-center h-24">
                <div className="flex items-center gap-2 text-slate-400 text-sm animate-pulse">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating logistics...
                </div>
            </div>
        );
    }

    // 1. ARRIVAL LOGIC
    const arrival = (plan as any).logistics?.arrival_guide || plan.arrival_guide || {
        primary_transport: 'Flight',
        travel_time: 'Calculated in background...',
        estimated_price_range: ''
    };

    // Choose icon based on transport type
    const TransportIcon = arrival.primary_transport.toLowerCase().includes('train') ? Train : Plane;

    // 2. BUDGET LOGIC
    // Sum total from breakdown
    const breakdown = plan.budget_breakdown;
    let totalBudget = 0;

    const parseIDR = (val: any) => {
        if (typeof val === 'number') return val;
        if (typeof val === 'string') return parseInt(val.replace(/[^0-9]/g, '')) || 0;
        return 0;
    };

    if (breakdown) {
        totalBudget =
            parseIDR(breakdown.transport) +
            parseIDR(breakdown.accommodation) +
            parseIDR(breakdown.food) +
            parseIDR(breakdown.tickets) +
            parseIDR(breakdown.misc);
    } else {
        // Fallback to trip budget if breakdown missing
        totalBudget = trip.budget || 0;
    }

    // CURRENCY CONVERSION (Smart Logic)
    // If total is unusually low (< 100,000 range usually implies USD/foreign currency context in this app's logic),
    // we assume it needs conversion to IDR.
    // However, the prompt specifically says "If total < 5000".
    let displayTotal = totalBudget;
    let currencyCode = 'IDR';

    if (totalBudget > 0 && totalBudget < 5000) {
        displayTotal = totalBudget * 15500;
    }

    const formattedBudget = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(displayTotal);

    // 3. CONTEXT (STYLE) TAGS
    // Parse style string or use array
    const styleTags = trip.style ? trip.style.split(',').map(s => s.trim()).filter(Boolean) : ['Exploration'];


    // 4. ACCOMMODATION LOGIC
    const accommodation = plan.strategic_accommodation?.[0] || {
        area_name: 'City Center',
        type: 'Hotel'
    };

    return (
        <div className="w-full bg-white border-b border-slate-200 py-3 md:py-4 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">

                {/* 1. TRANSPORT */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                        <TransportIcon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transport</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {arrival.primary_transport} ({arrival.travel_time})
                        </p>
                    </div>
                </div>

                {/* 2. ACCOMMODATION */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
                        <Compass className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accommodation</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {accommodation.area_name}
                        </p>
                    </div>
                </div>

                {/* 3. BUDGET */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0 text-emerald-600">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Biaya</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {formattedBudget}
                        </p>
                    </div>
                </div>

                {/* 4. VIBE */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 text-purple-600">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gaya Trip</p>
                        <p className="text-xs font-bold text-slate-800 truncate">
                            {styleTags[0]} {styleTags.length > 1 && `+${styleTags.length - 1}`}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
