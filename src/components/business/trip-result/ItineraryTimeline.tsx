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
}

export default function ItineraryTimeline({ plan, onReplace, onDelete, onAddBelow }: ItineraryTimelineProps) {
    // Default expand hari pertama (Day 1)
    const [expandedDays, setExpandedDays] = useState<number[]>([1]);

    // 🛡️ Safe Access: Pastikan itinerary selalu array
    const itinerary = plan?.itinerary || [];

    const toggleDay = (dayNum: number) => {
        setExpandedDays(prev =>
            prev.includes(dayNum) ? prev.filter(d => d !== dayNum) : [...prev, dayNum]
        );
    };

    const toggleAll = () => {
        if (expandedDays.length === itinerary.length) {
            setExpandedDays([]);
        } else {
            setExpandedDays(itinerary.map((d) => d.day));
        }
    };

    // Jika data kosong, tampilkan placeholder
    if (itinerary.length === 0) {
        return (
            <div className="lg:col-span-2 p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-in fade-in">
                <p className="text-slate-400 italic">Waiting for itinerary details...</p>
            </div>
        );
    }

    // Render Single Activity Item
    const renderActivity = (act: Activity, idx: number, total: number, dayNum: number) => {
        const style = getTimeBasedStyle(act.time);
        const TimeIcon = style.icon;

        return (
            <div key={idx} className="relative pl-10 pb-12 last:pb-0 group/act animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Connector Line - Solid Gradient (Premium iOS Feel) */}
                {idx !== total - 1 && (
                    <div className="absolute left-[16.5px] top-8 bottom-0 w-[3px] bg-gradient-to-b from-[#42707D] via-[#42707D]/60 to-orange-400 rounded-full" />
                )}

                {/* Dot Marker - White with Teal Border (iOS Signature Look) */}
                <div className="absolute left-0 top-1 w-9 h-9 rounded-full flex items-center justify-center border-4 border-[#42707D] bg-white shadow-xl z-10 transition-transform group-hover/act:scale-110">
                    <TimeIcon className="w-4 h-4 text-[#42707D]" />
                </div>

                {/* Activity Card */}
                <ActivityCard
                    activity={act}
                    onReplace={() => onReplace?.(dayNum, idx)}
                    onDelete={() => onDelete?.(dayNum, idx)}
                    onAddBelow={() => onAddBelow?.(dayNum, idx)}
                />
            </div>
        );
    };

    return (
        <div className="lg:col-span-2 space-y-6">
            {/* Control Bar */}
            <div className="flex items-center justify-between sticky top-20 z-30 bg-slate-50/95 backdrop-blur-sm py-3 rounded-xl border border-slate-200/50 px-4 shadow-sm mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-teal-600" /> Journey Timeline
                </h3>
                <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs text-blue-600 hover:text-blue-700 h-8">
                    {expandedDays.length === itinerary.length ? "Collapse All" : "Expand All"}
                </Button>
            </div>

            {itinerary.map((day: ItineraryItem) => {
                const isOpen = expandedDays.includes(day.day);

                // 🛡️ Safety: Pastikan activities array
                const activities = day.activities || [];

                return (
                    <div id={`day-${day.day}`} key={day.day} className="relative transition-all duration-300 group/day">
                        {/* ACCORDION HEADER (Sticky) */}
                        <div
                            onClick={() => toggleDay(day.day)}
                            className={cn(
                                "sticky top-36 z-20 mb-6 cursor-pointer select-none",
                                "py-2 bg-slate-50/95 backdrop-blur-sm",
                                "transition-all duration-200"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "px-4 py-2 rounded-r-full rounded-l-lg shadow-sm font-bold text-sm flex items-center gap-2 transition-all border",
                                    isOpen ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                                )}>
                                    <Calendar className={cn("w-4 h-4", isOpen ? "text-teal-400" : "text-slate-400")} />
                                    Day {day.day}
                                    {isOpen ? <ChevronUp className="w-3 h-3 ml-1 text-slate-400" /> : <ChevronDown className="w-3 h-3 ml-1 text-slate-400" />}
                                </div>
                                <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-300 to-transparent"></div>
                                <span className={cn("text-sm font-medium italic pr-4 truncate max-w-[200px] sm:max-w-none transition-colors", isOpen ? "text-blue-600" : "text-slate-400")}>
                                    {day.title}
                                </span>
                            </div>
                        </div>

                        {/* ACCORDION CONTENT */}
                        {/* 🔴 FIX: Tambahkan style manual gridTemplateRows agar animasi jalan sempurna */}
                        <div
                            className={cn(
                                "grid transition-all duration-500 ease-in-out overflow-hidden",
                                isOpen ? "opacity-100 mb-12" : "opacity-0 mb-0"
                            )}
                            style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                        >
                            <div className="overflow-hidden min-h-0">
                                <div className="ml-4 md:ml-8 border-l-2 border-dashed border-slate-200 pl-4 md:pl-8 py-2 space-y-2">
                                    {activities.map((act, idx) => renderActivity(act, idx, activities.length, day.day))}

                                    {activities.length === 0 && (
                                        <p className="text-sm text-slate-400 italic py-2">No activities planned for this day.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}

            <div className="flex justify-center py-8 opacity-50">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-widest border-b border-slate-300 pb-1">End of Trip</span>
            </div>
        </div>
    );
}