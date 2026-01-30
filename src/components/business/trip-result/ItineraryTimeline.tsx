import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, ChevronDown, ChevronUp, Coffee, Sun, Sunset, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TripResponse, ItineraryItem, Activity } from '@/types';

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

export default function ItineraryTimeline({ plan }: { plan: TripResponse['plan'] }) {
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
    const renderActivity = (act: Activity, idx: number, total: number) => {
        const style = getTimeBasedStyle(act.time);
        const TimeIcon = style.icon;

        return (
            <div key={idx} className="relative pl-8 pb-12 last:pb-0 group animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Connector Line */}
                {idx !== total - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gradient-to-b from-slate-200 to-slate-50 group-hover:from-blue-200 group-hover:to-blue-50 transition-colors" />
                )}

                {/* Icon Marker */}
                <div className={cn("absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 bg-white shadow-sm z-10 transition-transform group-hover:scale-110", style.border)}>
                    <TimeIcon className={cn("w-4 h-4", style.color)} />
                </div>

                {/* Card Content */}
                <div className={cn("rounded-xl p-4 border transition-all duration-300 hover:shadow-md bg-white relative overflow-hidden", "border-slate-100 hover:border-blue-100")}>
                    {/* Background Blob Decoration */}
                    <div className={cn("absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 blur-2xl", style.bg.replace('bg-', 'bg-'))} />

                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <Badge variant="outline" className={cn("font-mono text-xs px-2 py-0.5 border-0", style.bg, style.color)}>
                            {act.time || "TBA"}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider bg-slate-100 text-slate-500">
                            {act.type || "Activity"}
                        </Badge>
                    </div>

                    <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors relative z-10">
                        {act.activity}
                    </h4>

                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1 mb-3 relative z-10">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium">{act.place_name || "Location TBD"}</span>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed border-l-2 border-slate-100 pl-3 italic relative z-10">
                        "{act.description}"
                    </p>
                </div>
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
                    <div key={day.day} className="relative transition-all duration-300 group/day">
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
                                    {activities.map((act, idx) => renderActivity(act, idx, activities.length))}

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