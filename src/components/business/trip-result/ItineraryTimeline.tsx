'use client';

import React from 'react';
import { Calendar, RefreshCw, Sparkles as SparklesIcon } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { TripResponse, Activity, ItineraryItem } from '@/types';
import ActivityCard from './ActivityCard';
import EnrichmentLoadingState from './EnrichmentLoadingState';
import { useSubscription } from '@/hooks/useSubscription';

// Time-of-day → dot accent color
const dotAccent = (timeStr: string) => {
    const h = parseInt((timeStr || '').split(':')[0]);
    if (isNaN(h) || h < 11) return 'border-zinc-300 bg-white';
    if (h < 16) return 'border-zinc-300 bg-white';
    if (h < 19) return 'border-zinc-300 bg-white';
    return 'border-zinc-300 bg-white';
};

const dotIcon = (timeStr: string) => {
    const h = parseInt((timeStr || '').split(':')[0]);
    if (isNaN(h) || h < 11) return '☕';
    if (h < 16) return '☀️';
    if (h < 19) return '🌅';
    return '🌙';
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
    startDate?: string;
    isEnriching?: boolean;
    onUpgrade?: () => void;
    aiEditsUsed?: number;
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
    aiEditsUsed = 0,
}: ItineraryTimelineProps) {
    const dayPlan = (plan?.itinerary || []).find((d: ItineraryItem) => d.day === activeDay);
    const { subscription } = useSubscription();
    const isPro = subscription?.subscription_tier === 'PRO';

    let dateDisplay = '';
    if (startDate) {
        const d = new Date(startDate);
        if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() + (activeDay - 1));
            dateDisplay = formatDate(d);
        }
    }

    const activities = React.useMemo(() => {
        let list = [...(dayPlan?.activities || [])].sort((a, b) =>
            (a.time || '').localeCompare(b.time || '')
        );
        if (!isPro) list = list.filter(act => !act.is_hidden_gem);
        return list;
    }, [dayPlan?.activities, isPro]);

    const showTeaser = !isPro && activities.length > 0;

    // Auto-scroll to first activity when activeDay changes
    React.useEffect(() => {
        const el = document.getElementById(`activity-${activeDay}-0`);
        if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 160;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    }, [activeDay]);

    const renderActivity = (act: Activity, idx: number, total: number, dayNum: number) => {
        const activityId = `${dayNum}-${idx}`;
        const isSelected = selectedActivityId === activityId;

        return (
            <div
                key={activityId}
                id={`activity-${activityId}`}
                className="relative pl-9 pb-4 last:pb-0"
            >
                {/* Connector line — Uber route timeline style */}
                {idx !== total - 1 && (
                    <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-zinc-200" />
                )}

                {/* Dot */}
                <div className={cn(
                    'absolute left-0 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 text-[12px] z-10 transition-all duration-200',
                    isSelected ? 'scale-110 border-zinc-950 bg-zinc-950 text-white shadow-sm' : dotAccent(act.time)
                )}>
                    {dotIcon(act.time)}
                </div>

                <ActivityCard
                    activity={act}
                    tripId={plan.trip_id}
                    dayIndex={dayNum - 1}
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

    return (
        <div className="pb-20">
            {/* Day context header */}
            <div className="px-4 pt-4 pb-3 animate-in fade-in duration-200">
                <h3 className="text-[17px] font-bold text-zinc-950">
                    {dayPlan?.title || `Hari ${activeDay}`}
                </h3>
                <p className="text-[12px] font-medium text-zinc-500 mt-0.5">
                    {dateDisplay && `${dateDisplay} · `}{activities.length} aktivitas
                </p>
            </div>

            {/* Enriching banner */}
            {isEnriching && activities.length > 0 && (
                <div className="mx-4 mb-3 flex items-center gap-2.5 px-3 py-2.5 bg-teal-50 border border-teal-200 rounded-xl animate-in fade-in duration-300">
                    <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin flex-shrink-0" />
                    <p className="text-[12px] font-medium text-teal-800">Menambahkan detail & hidden gems…</p>
                </div>
            )}

            {/* Activities */}
            <div className="px-4">
                {!dayPlan || !dayPlan.activities || dayPlan.activities.length === 0 ? (
                    isEnriching ? (
                        <EnrichmentLoadingState />
                    ) : (
                        <div className="py-10 text-center border border-zinc-200 rounded-2xl border-dashed bg-zinc-50 animate-in fade-in">
                            <div className="w-12 h-12 bg-white border border-zinc-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Calendar className="w-5 h-5 text-zinc-400" />
                            </div>
                            <p className="text-[13px] font-medium text-zinc-500">Belum ada aktivitas untuk Hari {activeDay}</p>
                        </div>
                    )
                ) : (
                    <>
                        <div className="space-y-1">
                            {activities.map((act, idx) => renderActivity(act, idx, activities.length, activeDay))}
                        </div>

                        {/* PRO teaser */}
                        {showTeaser && (
                            <button
                                onClick={onUpgrade}
                                className="mt-4 w-full flex items-center gap-2.5 px-4 py-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:border-zinc-950 transition-colors text-left"
                            >
                                <SparklesIcon className="w-4 h-4 text-teal-600 flex-shrink-0" />
                                <p className="text-[12px] font-semibold text-zinc-800 flex-1">
                                    Hidden gems & rahasia lokal tersedia di PRO
                                </p>
                                <span className="text-[11px] font-bold text-white bg-zinc-950 px-2.5 py-1 rounded-full">
                                    Upgrade →
                                </span>
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Day nav footer */}
            <div className="flex items-center justify-between mx-4 mt-8 pt-5 border-t border-zinc-200">
                {activeDay > 1 ? (
                    <button
                        onClick={() => onDayChange?.(activeDay - 1)}
                        className="text-[13px] font-semibold text-zinc-600 hover:text-zinc-950 transition-colors"
                    >
                        ← Hari {activeDay - 1}
                    </button>
                ) : <div />}

                {activeDay < (totalDays || 0) ? (
                    <button
                        onClick={() => onDayChange?.(activeDay + 1)}
                        className="text-[13px] font-bold text-zinc-950 hover:text-teal-600 transition-colors"
                    >
                        Hari {activeDay + 1} →
                    </button>
                ) : (
                    <span className="text-[12px] font-medium text-zinc-500">Akhir perjalanan 🎉</span>
                )}
            </div>
        </div>
    );
}
