'use client';

import React from 'react';
import ItineraryTimeline from '@/components/business/trip-result/ItineraryTimeline';
import DayNavigator from '@/components/business/trip-result/DayNavigator';
import ItineraryLoadingState from '@/components/business/ItineraryLoadingState';
import EnrichmentLoadingState from '@/components/business/trip-result/EnrichmentLoadingState';
import { Trip, TripPlan } from '@/types';

interface ItineraryViewProps {
    trip: Trip;
    plan: TripPlan;
    activeDay: number;
    onDayChange: (day: number) => void;
    onReplace: (day: number, index: number) => void;
    onDelete: (day: number, index: number) => void;
    onAddBelow: (day: number, index: number, time: string) => void;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
    isEnriching?: boolean;
    startTime?: number;
    onUpgrade?: () => void;
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
    isEnriching = false,
    startTime,
    onUpgrade
}: ItineraryViewProps) {
    const isCurating = trip.itinerary_status === 'pending' ||
        trip.itinerary_status === 'generating';

    const dayArray = (plan?.itinerary || []).map(d => d.day);
    const activeDayActivities = React.useMemo(() => {
        return plan.itinerary?.find(d => d.day === activeDay)?.activities || [];
    }, [plan.itinerary, activeDay]);

    return (
        <div className="animate-in fade-in duration-300">
            {isCurating ? (
                <ItineraryLoadingState startTime={startTime} />
            ) : (
                <>
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

                    {/* Full-width timeline — no side-by-side map on mobile */}
                    <div className="w-full">
                        {(isEnriching && activeDayActivities.length === 0) ? (
                            <EnrichmentLoadingState />
                        ) : (
                            <ItineraryTimeline
                                key={`timeline-${activeDay}`}
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
                                onUpgrade={onUpgrade}
                                aiEditsUsed={trip.ai_edits_used || 0}
                            />
                        )}

                        {/* 💡 Booking urgency tip — shown after itinerary loads */}
                        {!isCurating && activeDayActivities.length > 0 && (
                            <div className="mt-10 mx-auto max-w-lg text-center px-4 py-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-sm font-medium animate-in fade-in duration-700">
                                💡 <span className="font-bold">Tip:</span> Segera amankan hotel dan tiket pesawat Anda sebelum harga naik!
                            </div>
                        )}

                    </div>
                </>
            )}
        </div>
    );
}
