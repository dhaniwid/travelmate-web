'use client';

import React from 'react';
import ItineraryTimeline from '@/components/business/trip-result/ItineraryTimeline';
import DayNavigator from '@/components/business/trip-result/DayNavigator';
import TripMap from '@/components/business/trip-result/TripMap';
import ItineraryLoadingState from '@/components/business/ItineraryLoadingState';
import EnrichmentLoadingState from '@/components/business/trip-result/EnrichmentLoadingState';
import { Trip, TripPlan, Activity } from '@/types';
import { Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
    const [showMap, setShowMap] = React.useState(false);

    const isCurating = trip.itinerary_status === 'pending' ||
        trip.itinerary_status === 'generating';
    // Enrichment is shown via a non-blocking banner in the parent component
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

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                        {/* Left: Timeline - Visible on desktop or when map is hidden on mobile */}
                        <div className={cn(
                            "col-span-12 lg:col-span-7",
                            showMap ? "hidden lg:block" : "block"
                        )}>
                            {(isEnriching && activeDayActivities.length === 0) ? (
                                <EnrichmentLoadingState />
                            ) : (
                                <ItineraryTimeline
                                    key={`timeline-${activeDay}`} // Force re-mount on day change to avoid stale state
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
                        </div>

                        {/* Right: Map Preview - Visible on desktop or when map is shown on mobile */}
                        <div className={cn(
                            "col-span-12 lg:col-span-5 lg:sticky lg:top-20",
                            showMap ? "block h-[80vh] lg:h-[500px]" : "hidden lg:block h-[500px]"
                        )}>
                            <div className="bg-slate-100 rounded-3xl p-3 border border-slate-200 shadow-inner h-full">
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                                        <MapIcon className="w-3.5 h-3.5" />
                                        Day {activeDay} Map
                                    </h4>
                                    {/* Mobile Close Map Button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowMap(false)}
                                        className="lg:hidden h-7 px-2 text-[10px] font-black uppercase text-teal-600 hover:text-teal-700 bg-teal-50"
                                    >
                                        Show List
                                    </Button>
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

                    {/* Mobile Map Toggle FAB */}
                    <div className="lg:hidden fixed bottom-24 right-4 z-50">
                        <Button
                            onClick={() => setShowMap(!showMap)}
                            className="bg-slate-900 text-white rounded-full w-14 h-14 shadow-2xl flex items-center justify-center border border-white/20 backdrop-blur-md active:scale-95 transition-all p-0"
                            title={showMap ? "Show List" : "Show Map"}
                        >
                            {showMap ? (
                                <span className="text-[10px] font-black uppercase">List</span>
                            ) : (
                                <MapIcon className="w-6 h-6" />
                            )}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
