'use client';

import React from 'react';
import FlightWatchCard from '@/components/business/trip/FlightWatchCard';
import { Trip, TripPlan } from '@/types';
import { PlaneTakeoff, Bell, TrendingDown, ArrowRight, Clock } from 'lucide-react';

interface LogisticsViewProps {
    trip: Trip;
    plan: TripPlan;
}

export default function LogisticsView({ trip, plan }: LogisticsViewProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <PlaneTakeoff className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Logistics Hub</h2>
                    <p className="text-sm text-slate-500 font-medium">
                        View your trip details and route summary to <span className="text-teal-600 font-bold">{trip.destination}</span>
                    </p>
                </div>
            </div>

            {/* Feature Highlights — real features only */}
            {/* Feature Highlights — temporarily hidden for launch 
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    {
                        icon: <TrendingDown className="w-5 h-5 text-emerald-600" />,
                        bg: 'bg-emerald-50',
                        title: 'Price Tracking',
                        desc: 'Monitor real-time flight prices and get notified when they drop.',
                    },
                    {
                        icon: <Bell className="w-5 h-5 text-blue-600" />,
                        bg: 'bg-blue-50',
                        title: 'Smart Alerts',
                        desc: 'Checks every 12 hours via Amadeus. You\'ll be notified of price drops automatically.',
                    },
                ].map((item, i) => (
                    <div key={i} className={`${item.bg} rounded-2xl p-5 flex items-start gap-4 border border-white`}>
                        <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-800 mb-0.5">{item.title}</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
            */}

            {/* Flight Watch Card — full width */}
            {/* Flight Watch Card — temporarily hidden for launch
            <FlightWatchCard
                tripId={trip.id}
                destinationCity={trip.destination}
                destinationAirport={plan.destination_airport}
                variant="full"
            />
            */}

            {/* Flight Search / Route Summary */}
            <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm relative group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-blue-500" />

                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
                        {/* Route Info */}
                        <div className="flex items-center gap-4 md:gap-8 flex-1 w-full relative pt-6 md:pt-0">
                            {/* Trip Duration Badge - Absolute Center or Top */}
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 z-10">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                                    {trip.trip_days} Day Trip
                                </span>
                            </div>

                            <div className="text-center min-w-[80px] flex-1">
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">From</div>
                                <div className="text-xl md:text-2xl font-black text-slate-900 truncate max-w-[150px] mx-auto leading-tight">
                                    {trip.origin.toUpperCase()}
                                </div>
                            </div>

                            <div className="w-16 flex flex-col items-center gap-1 shrink-0">
                                <div className="w-full flex items-center gap-2 opacity-20">
                                    <div className="h-0.5 flex-1 bg-slate-900 border-b border-dashed border-slate-300" />
                                    <PlaneTakeoff className="w-5 h-5 text-slate-900" />
                                    <div className="h-0.5 flex-1 bg-slate-900 border-b border-dashed border-slate-300" />
                                </div>
                            </div>

                            <div className="text-center min-w-[80px] flex-1">
                                <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">To</div>
                                <div className="text-2xl md:text-3xl font-black text-teal-600 truncate max-w-[150px] mx-auto leading-tight">
                                    {plan.destination_airport || trip.destination.toUpperCase()}
                                </div>
                                <div className="text-[10px] font-bold text-teal-600/60 bg-teal-50 px-2 py-0.5 rounded-full inline-block mt-1 truncate max-w-[100px]">
                                    {trip.destination}
                                </div>
                            </div>
                        </div>

                        {/* Action */}
                        <div className="w-full md:w-auto mt-4 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-slate-100 flex flex-col gap-3">
                            <a
                                href={`https://www.skyscanner.com/transport/flights/${trip.origin}/${trip.destination}/${trip.start_date.split('T')[0]}`} // Basic Skyscanner link construction
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                Book Flights
                                <ArrowRight className="w-4 h-4 ml-1" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Decorative circles for 'ticket' look */}
                <div className="absolute top-1/2 -left-3 w-6 h-6 bg-slate-50 rounded-full" />
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-50 rounded-full" />
            </div>
        </div>
    );
}
