import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ChevronDown, ChevronUp, Coffee, Sun, Sunset, Moon, RefreshCw, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripResponse, ItineraryItem, Activity } from '@/types';
import ActivityCard from './ActivityCard';

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
    onAddBelow?: (day: number, index: number) => void;
    destinationName: string;
    activeDay: number;
    selectedActivityId: string | null;
    onActivitySelect: (id: string | null) => void;
    onDayChange?: (day: number) => void;
    totalDays?: number;
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
    totalDays
}: ItineraryTimelineProps) {
    // 🛡️ Safe Access: Pastikan itinerary selalu array
    const itinerary = plan?.itinerary || [];

    // STRICT TABS: Filter only for the active day
    const dayPlan = (plan?.itinerary || []).find(d => d.day === activeDay);

    // Jika data kosong atau hari tidak ditemukan, tampilkan placeholder
    if (!dayPlan || !dayPlan.activities || dayPlan.activities.length === 0) {
        return (
            <div className="lg:col-span-2 p-12 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 animate-in fade-in">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-lg font-bold text-slate-700 mb-1">No activities for Day {activeDay}</h4>
                <p className="text-slate-400 text-sm italic">Planning is still in progress...</p>
            </div>
        );
    }

    const activities = dayPlan.activities;

    // Render Single Activity Item
    const renderActivity = (act: Activity, idx: number, total: number, dayNum: number) => {
        const style = getTimeBasedStyle(act.time);
        const TimeIcon = style.icon;
        const activityId = `${dayNum}-${idx}`;
        const isSelected = selectedActivityId === activityId;

        return (
            <div
                key={idx}
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
                    onReplace={() => onReplace?.(dayNum, idx)}
                    onDelete={() => onDelete?.(dayNum, idx)}
                    onAddBelow={() => onAddBelow?.(dayNum, idx)}
                    destinationName={destinationName}
                    isSelected={isSelected}
                    onClick={() => onActivitySelect(isSelected ? null : activityId)}
                />
            </div>
        );
    };

    return (
        <div className="lg:col-span-2 space-y-8 pb-20">
            {/* Header for Day Context */}
            <div className="mb-8 animate-in fade-in delay-75">
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
                    {dayPlan.title}
                </h3>
                <p className="text-slate-500 font-medium">
                    Day {activeDay} • {activities.length} planned activities
                </p>
            </div>

            <div className="ml-2 md:ml-4 border-l-0 space-y-2">
                {(activities || []).map((act, idx) => renderActivity(act, idx, activities.length, activeDay))}
            </div>

            {activeDay < (totalDays || 0) && (
                <button
                    onClick={() => onDayChange?.(activeDay + 1)}
                    className="w-full py-4 mt-8 bg-slate-50 hover:bg-slate-100 text-slate-600 font-medium rounded-xl border border-dashed border-slate-300 transition-all flex items-center justify-center gap-2 group"
                >
                    Continue to Day {activeDay + 1}
                    <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-12" />
                </button>
            )}

            <div className="flex justify-center py-8 opacity-50">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-1">End of Day {activeDay}</span>
            </div>
        </div>
    );
}