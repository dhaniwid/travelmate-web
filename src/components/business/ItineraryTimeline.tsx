'use client';

import {useState} from "react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Clock, MapPin, RefreshCw, Footprints, Car, CalendarDays} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {ItineraryItem, Activity} from "@/types";
import DailyBriefingCard from "./DailyBriefingCard";

const formatDate = (startDateStr: string, dayOffset: number) => {
    if (!startDateStr) return "";
    const date = new Date(startDateStr);
    date.setDate(date.getDate() + dayOffset); // Add days

    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
    }).format(date);
};

export default function ItineraryTimeline({ days, startDate }: ItineraryTimelineProps) {
    return (
        <div className="w-full">
            <Accordion type="single" collapsible defaultValue="item-1" className="space-y-6">
                {days.map((day) => (
                    <AccordionItem
                        key={day.day}
                        value={`item-${day.day}`}
                        className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden px-0"
                    >
                        {/* --- HEADER ACCORDION (HARI & TANGGAL) --- */}
                        <AccordionTrigger className="hover:no-underline px-6 py-4 bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-5 text-left w-full">
                                {/* Kotak Day Number */}
                                <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-md shadow-blue-200">
                                    <span className="text-[9px] font-bold opacity-80 uppercase tracking-wider">Day</span>
                                    <span className="font-black text-2xl leading-none">{day.day}</span>
                                </div>

                                {/* Judul & Tanggal */}
                                <div className="flex-1">
                                    <h4 className="text-lg md:text-xl font-bold text-slate-800 line-clamp-1">
                                        {day.title}
                                    </h4>
                                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                                        <CalendarDays className="w-3.5 h-3.5" />
                                        <span className="text-sm font-medium">
                                            {formatDate(startDate, day.day)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </AccordionTrigger>

                        {/* --- CONTENT (BRIEFING + TIMELINE) --- */}
                        <AccordionContent className="px-6 md:px-8 pb-8 pt-2">

                            {/* 1. Contextual Briefing (Cuaca & Outfit) */}
                            {day.morning_briefing && (
                                <div className="mt-4 mb-8">
                                    <DailyBriefingCard briefing={day.morning_briefing} />
                                </div>
                            )}

                            {/* 2. Timeline List */}
                            <div className="relative ml-4 md:ml-6 pl-8 space-y-0">
                                {/* Garis Vertikal Utama */}
                                <div className="absolute left-[39px] top-2 bottom-6 w-0.5 bg-slate-100" />

                                {day.activities.map((act, i) => (
                                    <TimelineItem
                                        key={i}
                                        activity={act}
                                        isLast={i === day.activities.length - 1}
                                        isFirst={i === 0}
                                    />
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

interface ItineraryTimelineProps {
    days: ItineraryItem[];
    startDate?: string;
}

// --- SUB-COMPONENT: TIMELINE ITEM WITH MAGIC SWAP ---
function TimelineItem({ activity, isLast, isFirst }: { activity: Activity, isLast: boolean, isFirst: boolean }) {
    const [isSwapped, setIsSwapped] = useState(false);

    const currentData = isSwapped && activity.alternative
        ? { ...activity.alternative, time: activity.time }
        : activity;

    const hasAlternative = !!activity.alternative;

    return (
        <div className="relative group pb-10 last:pb-0">

            {/* SMART CONNECTOR */}
            {/* Logic: Muncul jika ada metode transit, bukan "Start", dan BUKAN ITEM PERTAMA */}
            {activity.transit_method && activity.transit_method !== "Start" && !isFirst && (
                <div className="absolute -top-6 left-[-60px] md:left-[-80px] w-full flex items-center mb-4 z-0 pointer-events-none">
                    <div className="ml-[60px] md:ml-[80px] bg-slate-50 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1.5 shadow-sm transform -translate-y-1/2">
                        {activity.transit_method.toLowerCase().includes("walk") ? <Footprints className="w-3 h-3"/> : <Car className="w-3 h-3"/>}
                        <span>{activity.transit_method}</span>
                        <span className="text-slate-300">•</span>
                        <span>{activity.transit_time}</span>
                    </div>
                </div>
            )}

            {/* Timeline Dot */}
            <div className={`absolute -left-[45px] top-0 w-4 h-4 rounded-full border-[3px] transition-colors duration-300 z-10 bg-white shadow-sm
                ${isSwapped ? 'border-purple-500' : 'border-slate-300 group-hover:border-blue-500'}`}
            />

            {/* Content Card */}
            <div className={`relative transition-all duration-500 ${isSwapped ? 'animate-in fade-in zoom-in-95' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="outline" className="font-bold border-slate-200 text-slate-600 px-2 py-1 flex items-center gap-1.5 bg-slate-50">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs leading-none">{currentData.time}</span>
                        </Badge>

                        <span className={`text-[10px] font-black uppercase tracking-widest pt-[2px]
                            ${isSwapped ? 'text-purple-500' : 'text-slate-400'}`}>
                            {currentData.type}
                        </span>
                    </div>

                    {hasAlternative && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsSwapped(!isSwapped)}
                            className="h-6 px-2 text-[10px] text-slate-400 hover:text-purple-600 hover:bg-purple-50"
                        >
                            <RefreshCw className={`w-3 h-3 mr-1 ${isSwapped ? 'text-purple-600' : ''}`} />
                            {isSwapped ? 'Restore' : 'Swap'}
                        </Button>
                    )}
                </div>

                <div className={`p-4 rounded-2xl border transition-all duration-300
                    ${isSwapped
                    ? 'bg-purple-50/50 border-purple-100'
                    : 'bg-white border-slate-100 hover:border-blue-200 hover:shadow-md'
                }`}>

                    <h5 className={`text-base font-bold transition-colors mb-1
                        ${isSwapped ? 'text-purple-900' : 'text-slate-900 group-hover:text-blue-600'}`}>
                        {currentData.activity}
                    </h5>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" />
                        {currentData.place_name}
                    </div>

                    <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{currentData.description}"
                    </p>
                </div>
            </div>
        </div>
    );
}