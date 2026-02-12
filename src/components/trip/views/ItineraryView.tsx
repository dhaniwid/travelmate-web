'use client';

import React from 'react';
import ItineraryTimeline from '@/components/business/trip-result/ItineraryTimeline';
import DayNavigator from '@/components/business/trip-result/DayNavigator';
import TripMap from '@/components/business/trip-result/TripMap';
import { Trip, TripPlan, Activity } from '@/types';
import { Map as MapIcon } from 'lucide-react';

interface ItineraryViewProps {
    trip: Trip;
    plan: TripPlan;
    activeDay: number;
    onDayChange: (day: number) => void;
    onReplace: (day: number, index: number) => void;
    onDelete: (day: number, index: number) => void;
    onAddBelow: (day: number, index: number) => void;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
    isEnriching?: boolean; // NEW
}

export default function ItineraryView({
    trip,
    plan,
    activeDay,
    onDayChange,
    onReplace,
    onDelete,
    onAddBelow,
    selectedActivityId,
    onActivitySelect,
    isEnriching = false
}: ItineraryViewProps) {
    const dayArray = (plan?.itinerary || []).map(d => d.day);
    const activeDayActivities = React.useMemo(() => {
        return plan.itinerary?.find(d => d.day === activeDay)?.activities || [];
    }, [plan.itinerary, activeDay]);

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <span className="w-2 h-8 bg-teal-500 rounded-full" />
                        Itinerary
                    </h2>
                    <p className="text-slate-500 mt-1 font-medium italic">Explore your day-by-day plan</p>
                </div>

                <DayNavigator
                    days={dayArray}
                    activeDay={activeDay}
                    onDayClick={onDayChange}
                    className="relative top-0 z-0 bg-transparent border-none py-0 shadow-none sticky-top-auto"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                {/* Left: Timeline */}
                <div className="col-span-12 lg:col-span-7">
                    <ItineraryTimeline
                        plan={plan}
                        onReplace={onReplace}
                        onDelete={onDelete}
                        onAddBelow={onAddBelow}
                        destinationName={trip.destination}
                        activeDay={activeDay}
                        selectedActivityId={selectedActivityId}
                        onActivitySelect={onActivitySelect}
                        onDayChange={onDayChange}
                        totalDays={dayArray.length}
                        startDate={trip.start_date}
                        isEnriching={isEnriching}
                    />
                </div>

                {/* Right: Map Preview */}
                <div className="hidden lg:block lg:col-span-5 sticky top-20 h-[500px]">
                    <div className="bg-slate-100 rounded-3xl p-3 border border-slate-200 shadow-inner h-full">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                <MapIcon className="w-3.5 h-3.5" />
                                Day {activeDay} Map
                            </h4>
                        </div>
                        <div className="w-full h-[calc(100%-40px)] rounded-2xl overflow-hidden shadow-sm">
                            <TripMap
                                activities={activeDayActivities}
                                destination={trip.destination}
                                activeDay={activeDay}
                                selectedActivityId={selectedActivityId}
                                onActivitySelect={onActivitySelect}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
