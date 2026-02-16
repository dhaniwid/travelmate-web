import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ChevronDown, ChevronUp, Coffee, Sun, Sunset, Moon, RefreshCw, Trash2, Plus, Sparkles as SparklesIcon, Lock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { TripResponse, ItineraryItem, Activity } from '@/types';
import ActivityCard from './ActivityCard';
import LockedActivityCard from './LockedActivityCard';
import EnrichmentLoadingState from './EnrichmentLoadingState';
import { useSubscription } from '@/hooks/useSubscription';
import { useRouter } from 'next/navigation';

// Helper Vibe Waktu
const getTimeBasedStyle = (timeStr: string) => {
    if (!timeStr) return { icon: Sun, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };

    const hour = parseInt(timeStr.split(':')[0]);
    if (isNaN(hour)) return { icon: Sun, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };

    if (hour < 11) return { icon: Coffee, color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" };
    if (hour < 16) return { icon: Sun, color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200" };
    if (hour < 19) return { icon: Sunset, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200" };
    return { icon: Moon, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200" };
};

interface ItineraryTimelineProps {
    plan: TripResponse['plan'];
    onReplace?: (day: number, index: number) => void;
    onDelete?: (day: number, index: number) => void;
    onAddBelow?: (day: number, index: number, time: string) => void;
    destinationName: string;
    activeDay: number;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
    onDayChange?: (day: number) => void;
    totalDays?: number;
    startDate?: string; // NEW PROP
    isEnriching?: boolean; // NEW: Progressive Loading State
    onUpgrade?: () => void;
    aiEditsUsed?: number; // NEW
}

export default function ItineraryTimeline({
    plan,
    onReplace,
    onDelete,
    onAddBelow,
    destinationName,
    activeDay,
    selectedActivityId,
    onActivitySelect,
    onDayChange,
    totalDays,
    startDate,
    isEnriching = false,
    onUpgrade,
    aiEditsUsed = 0
}: ItineraryTimelineProps) {
    // 🛡️ Safe Access: Pastikan itinerary selalu array
    const itinerary = plan?.itinerary || [];

    // STRICT TABS: Filter only for the active day
    const dayPlan = (plan?.itinerary || []).find(d => d.day === activeDay);

    // Calculate Date for this day
    let dateDisplay = "";
    if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + (activeDay - 1));
            dateDisplay = ` • ${formatDate(d)}`;
        }
    }

    const { subscription } = useSubscription();
    const router = useRouter();
    const isPro = subscription?.subscription_tier === 'PRO';

    const activities = React.useMemo(() => {
        let list = [...(dayPlan?.activities || [])].sort((a, b) => {
            return (a.time || "").localeCompare(b.time || "");
        });

        // HIDDEN GEMS LOGIC
        if (!isPro) {
            // 1. Hide actual hidden gems from FREE users
            list = list.filter(act => !act.is_hidden_gem);
        }

        return list;
    }, [dayPlan?.activities, isPro]);

    // TEASER LOGIC: Inject locked card if FREE user on Day 1 or 2
    const showTeaser = !isPro && (activeDay === 1 || activeDay === 2) && activities.length > 0;

    // Render Single Activity Item
    const renderActivity = (act: Activity, idx: number, total: number, dayNum: number) => {
        const style = getTimeBasedStyle(act.time);
        const TimeIcon = style.icon;
        const activityId = `${dayNum}-${idx}`;
        const isSelected = selectedActivityId === activityId;

        return (
            <div
                key={activityId} // Use stable activityId instead of idx
                id={`activity-${activityId}`}
                className="relative pl-10 pb-12 last:pb-0 group/act animate-in fade-in slide-in-from-top-2 duration-300"
            >
                {/* Connector Line - Solid Gradient (Premium iOS Feel) */}
                {idx !== total - 1 && (
                    <div className="absolute left-[16.5px] top-8 bottom-0 w-[3px] bg-gradient-to-b from-[#42707D] via-[#42707D]/60 to-orange-400 rounded-full" />
                )}

                {/* Dot Marker - White with Teal Border (iOS Signature Look) */}
                <div className={cn(
                    "absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center border-4 z-10 transition-all duration-300 group-hover/act:scale-110",
                    isSelected ? "border-[#42707D] bg-[#42707D] scale-110 shadow-lg" : "border-[#42707D] bg-white shadow-xl"
                )}>
                    <TimeIcon className={cn(
                        "w-4 h-4 transition-colors",
                        isSelected ? "text-white" : "text-[#42707D]"
                    )} />
                </div>

                {/* Activity Card */}
                <ActivityCard
                    activity={act}
                    tripId={plan.trip_id}
                    dayIndex={dayNum - 1} // 0-indexed for backend
                    activityIndex={idx}
                    onReplace={() => onReplace?.(dayNum, idx)}
                    onDelete={() => onDelete?.(dayNum, idx)}
                    onAddBelow={(time: string) => onAddBelow?.(dayNum, idx, time)}
                    destinationName={destinationName}
                    isSelected={isSelected}
                    isExpanded={isSelected}
                    onClick={() => onActivitySelect(isSelected ? null : activityId)}
                    isLoading={isEnriching}
                    isPro={isPro}
                    aiEditsUsed={aiEditsUsed}
                />
            </div>
        );
    };

    // Auto-scroll to first activity when activeDay changes
    React.useEffect(() => {
        const firstActivityId = `activity-${activeDay}-0`;
        const element = document.getElementById(firstActivityId);
        if (element) {
            const yOffset = -150;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [activeDay]);

    return (
        <div className="lg:col-span-2 space-y-8 pb-20 px-4 md:px-0">
            {/* Header for Day Context */}
            <div className="mb-8 animate-in fade-in delay-75">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    {dayPlan?.title || `Day ${activeDay}`}
                </h3>
                <p className="text-slate-500 font-medium">
                    Day {activeDay}{dateDisplay} • {activities.length} planned activities
                </p>
            </div>

            <div className="ml-2 md:ml-4 border-l-0 space-y-2">
                {isEnriching && activities.length > 0 && (
                    <div className="mb-6 bg-teal-50/50 border border-teal-100/50 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-500">
                        <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
                        <p className="text-xs font-medium text-teal-800">
                            Refining descriptions & finding hidden gems for your activities...
                        </p>
                    </div>
                )}
                {!dayPlan || !dayPlan.activities || dayPlan.activities.length === 0 ? (
                    isEnriching ? (
                        <EnrichmentLoadingState />
                    ) : (
                        <div key="empty-day" className="p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 mb-1">No activities for Day {activeDay}</h4>
                            <p className="text-slate-400 text-sm italic">Planning is still in progress...</p>
                        </div>
                    )
                ) : (
                    <>
                        {activities.map((act, idx) => {
                            // Inject teaser at second position (index 1) or last if only 1 activity
                            const injectOffset = activities.length > 1 ? 1 : 0;
                            const isTeaserTime = showTeaser && idx === injectOffset;

                            return (
                                <React.Fragment key={`group-${idx}`}>
                                    {renderActivity(act, idx, activities.length, activeDay)}
                                    {isTeaserTime && (
                                        <div className="relative pl-10 pb-12 group/teaser">
                                            <div className="absolute left-[16.5px] top-8 bottom-0 w-[3px] bg-slate-200 border-r border-slate-300/50 rounded-full" />
                                            <div className="absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center border-4 border-slate-200 bg-white shadow-sm z-10 transition-all duration-300">
                                                <Lock className="w-4 h-4 text-slate-400" />
                                            </div>
                                            <LockedActivityCard
                                                onClick={onUpgrade}
                                            />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </>
                )}
            </div>

            {/* Day Navigation Footer */}
            <div className="flex justify-between mt-12 pt-8 border-t border-slate-100">
                {activeDay > 1 ? (
                    <button
                        onClick={() => onDayChange?.(activeDay - 1)}
                        className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors"
                    >
                        ← Day {activeDay - 1}
                    </button>
                ) : <div />}

                {activeDay < (totalDays || 0) ? (
                    <button
                        onClick={() => onDayChange?.(activeDay + 1)}
                        className="flex items-center gap-2 font-black text-blue-600 hover:text-blue-700 transition-all hover:translate-x-1"
                    >
                        Day {activeDay + 1} →
                    </button>
                ) : (
                    <span className="text-slate-400 font-bold flex items-center gap-2 italic">
                        End of Trip 🎉
                    </span>
                )}
            </div>
        </div>
    );
}