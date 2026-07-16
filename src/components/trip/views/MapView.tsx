'use client';

import React, { useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { ItineraryItem, Trip } from '@/types';
import { Map as MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const TripMap = dynamic(() => import('@/components/business/trip-result/TripMap'), { ssr: false });

// Must match TripMap DAY_COLORS exactly
const DAY_COLORS = [
    '#14b8a6', // teal   — Hari 1
    '#f97316', // orange — Hari 2
    '#a855f7', // purple — Hari 3
    '#ec4899', // pink   — Hari 4
    '#f59e0b', // amber  — Hari 5
    '#06b6d4', // cyan   — Hari 6
    '#3b82f6', // blue   — Hari 7+
];

const TOD_EMOJI = (timeStr: string) => {
    const h = parseInt((timeStr || '').split(':')[0]);
    if (isNaN(h) || h < 11) return '☕';
    if (h < 16) return '☀️';
    if (h < 19) return '🌅';
    return '🌙';
};

const isValidCoordinate = (lat: any, lng: any): boolean => {
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    return !isNaN(numLat) && !isNaN(numLng) && isFinite(numLat) && isFinite(numLng)
        && !(numLat === 0 && numLng === 0);
};

interface MapViewProps {
    trip: Trip;
    itinerary: ItineraryItem[];
    selectedActivityId?: string | null;
    onActivitySelect?: (id: string | null) => void;
}

export default function MapView({
    trip,
    itinerary,
    selectedActivityId = null,
    onActivitySelect = () => { },
}: MapViewProps) {
    const listRef = useRef<HTMLDivElement>(null);

    // Filter state — all days visible by default
    const allDayNumbers = useMemo(() => itinerary.map(d => d.day), [itinerary]);
    const [activeDays, setActiveDays] = useState<Set<number>>(() => new Set(allDayNumbers));

    const toggleDay = (day: number) => {
        setActiveDays(prev => {
            const next = new Set(prev);
            if (next.has(day)) {
                // Don't allow hiding all days
                if (next.size === 1) return prev;
                next.delete(day);
            } else {
                next.add(day);
            }
            return next;
        });
    };

    // Count all valid pins (unfiltered) to decide empty state
    const totalValidPins = useMemo(() =>
        itinerary.reduce((sum, day) =>
            sum + day.activities.filter(a => isValidCoordinate(a.latitude, a.longitude)).length, 0
        ), [itinerary]);

    // Flat list of valid pins respecting active filter (for activity list below map)
    const visiblePins = useMemo(() =>
        itinerary
            .filter(d => activeDays.has(d.day))
            .flatMap(dayItem =>
                dayItem.activities
                    .filter(a => isValidCoordinate(a.latitude, a.longitude))
                    .map((act, actIdx) => ({
                        act,
                        day: dayItem.day,
                        activityIndex: actIdx,
                        id: `${dayItem.day}-${actIdx}`,
                        color: DAY_COLORS[(dayItem.day - 1) % DAY_COLORS.length],
                    }))
            ),
        [itinerary, activeDays]
    );

    const handlePinSelect = (id: string | null) => {
        onActivitySelect(id);
        if (id && listRef.current) {
            const el = listRef.current.querySelector(`[data-activity-id="${id}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
    };

    // Trip has no coordinates at all → informative empty state
    if (totalValidPins === 0) {
        return (
            <div className="py-12 flex flex-col items-center gap-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                    <MapIcon className="w-7 h-7 text-white/20" />
                </div>
                <div className="text-center max-w-[260px]">
                    <p className="text-[15px] font-semibold text-white/50 mb-1">Peta tidak tersedia</p>
                    <p className="text-[12px] text-white/30 leading-relaxed">
                        Trip ini dibuat sebelum fitur koordinat tersedia. Buat trip baru untuk melihat peta interaktif.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 animate-in fade-in duration-300 pb-20 -mx-4 md:-mx-8">

            {/* Map — full bleed */}
            <div className="h-[calc(100vh-320px)] min-h-[360px] w-full relative">
                <div className="w-full h-full border-y border-white/8 overflow-hidden">
                    <TripMap
                        itinerary={itinerary}
                        destination={trip.destination}
                        selectedActivityId={selectedActivityId}
                        onActivitySelect={handlePinSelect}
                        activeDays={activeDays}
                    />
                </div>
            </div>

            {/* Legend — horizontal scroll chips, clickable filter */}
            {itinerary.length > 1 && (
                <div className="px-4 md:px-8">
                    <div className="flex gap-2 overflow-x-auto scrollbar-none snap-x pb-0.5">
                        {itinerary.map(dayItem => {
                            const color = DAY_COLORS[(dayItem.day - 1) % DAY_COLORS.length];
                            const isActive = activeDays.has(dayItem.day);
                            return (
                                <button
                                    key={dayItem.day}
                                    onClick={() => toggleDay(dayItem.day)}
                                    className={cn(
                                        'snap-start flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all duration-150',
                                        isActive
                                            ? 'border-transparent text-white'
                                            : 'bg-transparent border-white/10 text-white/30'
                                    )}
                                    style={isActive ? { background: color + '22', borderColor: color + '55', color } : undefined}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full flex-shrink-0"
                                        style={{ background: isActive ? color : 'rgba(255,255,255,0.15)' }}
                                    />
                                    Hari {dayItem.day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Activity list — horizontal scroll cards */}
            {visiblePins.length > 0 && (
                <div className="px-4 md:px-8">
                    <p className="text-[11px] uppercase tracking-widest text-white/35 mb-2">
                        {visiblePins.length} lokasi ditampilkan
                    </p>
                    <div
                        ref={listRef}
                        className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-none"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {visiblePins.map(pin => {
                            const isSelected = selectedActivityId === pin.id;
                            return (
                                <button
                                    key={pin.id}
                                    data-activity-id={pin.id}
                                    onClick={() => handlePinSelect(isSelected ? null : pin.id)}
                                    className={cn(
                                        'snap-start flex-shrink-0 w-44 text-left rounded-2xl border p-3 transition-all duration-150',
                                        isSelected
                                            ? 'border-teal-500/40 bg-[#0D2040] ring-1 ring-teal-500/30'
                                            : 'border-white/8 bg-[#0A1628] hover:border-white/16'
                                    )}
                                >
                                    <div className="flex items-center gap-1.5 mb-1.5">
                                        <span
                                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                                            style={{ background: pin.color }}
                                        >
                                            Hari {pin.day}
                                        </span>
                                        <span className="text-[11px]">{TOD_EMOJI(pin.act.time)}</span>
                                    </div>
                                    <p className={cn(
                                        'text-[12px] font-semibold line-clamp-2 leading-snug',
                                        isSelected ? 'text-white' : 'text-white/80'
                                    )}>
                                        {pin.act.activity}
                                    </p>
                                    {pin.act.place_name && (
                                        <p className="text-[10px] mt-1 truncate text-white/35">
                                            {pin.act.place_name}
                                        </p>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
