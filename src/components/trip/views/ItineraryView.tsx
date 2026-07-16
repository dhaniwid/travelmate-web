'use client';

import React from 'react';
import ItineraryTimeline from '@/components/business/trip-result/ItineraryTimeline';
import DayNavigator from '@/components/business/trip-result/DayNavigator';
import ItineraryLoadingState from '@/components/business/ItineraryLoadingState';
import EnrichmentLoadingState from '@/components/business/trip-result/EnrichmentLoadingState';
import TripStatsGrid from '@/components/business/trip-result/TripStatsGrid';
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
    onUpgrade,
}: ItineraryViewProps) {
    const isCurating =
        trip.itinerary_status === 'pending' || trip.itinerary_status === 'generating';

    const dayArray = (plan?.itinerary || []).map(d => d.day);
    const activeDayActivities = React.useMemo(
        () => plan.itinerary?.find(d => d.day === activeDay)?.activities || [],
        [plan.itinerary, activeDay]
    );

    if (isCurating) {
        return <ItineraryLoadingState startTime={startTime} />;
    }

    return (
        <div className="animate-in fade-in duration-300 -mx-4 md:-mx-8">
            {/* Stats grid — 3 tiles: Aktivitas / Estimasi / Cuaca */}
            <TripStatsGrid plan={plan} destination={trip.destination} />

            {/* Day selector — sticky below tab bar */}
            <DayNavigator
                days={dayArray}
                activeDay={activeDay}
                onDayClick={onDayChange}
            />

            {/* Timeline */}
            {isEnriching && activeDayActivities.length === 0 ? (
                <div className="px-4 pt-4">
                    <EnrichmentLoadingState />
                </div>
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
                    aiEditsUsed={(trip as any).ai_edits_used || 0}
                />
            )}
        </div>
    );
}
