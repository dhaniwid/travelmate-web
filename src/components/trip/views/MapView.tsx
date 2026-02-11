'use client';

import React from 'react';
import TripMap from '@/components/business/trip-result/TripMap';
import { Activity, Trip } from '@/types';
import { Map as MapIcon, Layers, Maximize, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MapViewProps {
    trip: Trip;
    activities: Activity[];
    selectedActivityId?: string | null;
    onActivitySelect?: (id: string | null) => void;
}

export default function MapView({
    trip,
    activities,
    selectedActivityId = null,
    onActivitySelect = () => { }
}: MapViewProps) {
    return (
        <div className="h-[calc(100vh-160px)] min-h-[600px] w-full relative animate-in zoom-in-95 duration-500">
            {/* Map Header Overlay */}
            <div className="absolute top-6 left-6 z-20 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-4 pointer-events-auto">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                        <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 leading-none mb-1">Interactive Map</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                            {activities.length} Points of Interest in {trip.destination}
                        </p>
                    </div>
                </div>
            </div>

            {/* Float Actions */}
            <div className="absolute right-6 top-6 z-20 flex flex-col gap-3">
                <button className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all border border-slate-100 active:scale-95">
                    <Layers className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 transition-all border border-slate-100 active:scale-95">
                    <Compass className="w-5 h-5" />
                </button>
            </div>

            {/* The Map Component */}
            <div className="w-full h-full rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
                <TripMap
                    activities={activities}
                    destination={trip.destination}
                    selectedActivityId={selectedActivityId}
                    onActivitySelect={onActivitySelect}
                    activeDay={1}
                />
            </div>

            {/* Legend / Status Overlay */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-full flex items-center gap-6 shadow-2xl border border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest">Active Route</span>
                    </div>
                    <div className="h-4 w-px bg-white/20" />
                    <div className="text-xs font-bold text-white/70">
                        {trip.destination} Discovery Map
                    </div>
                </div>
            </div>
        </div>
    );
}
