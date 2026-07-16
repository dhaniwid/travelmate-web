'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TripResponse, ItineraryItem, Activity } from '@/types';
import { useRouter } from 'next/navigation';
import { MapPin, CheckCircle2, ChevronDown, ChevronUp, List, Map } from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getTodayDayIndex(startDate: string | undefined): number {
    if (!startDate) return 0;
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.floor((today.getTime() - start.getTime()) / 86400000);
    return Math.max(0, Math.min(diff, 99));
}

function getMapsUrl(activity: Activity, destination: string): string {
    if (activity.latitude && activity.longitude) {
        return `https://www.google.com/maps/search/?api=1&query=${activity.latitude},${activity.longitude}`;
    }
    const q = encodeURIComponent(`${activity.place_name || activity.activity} ${destination}`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function checkinKey(tripId: string) {
    return `travel_checkin_${tripId}`;
}

function loadCheckins(tripId: string): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = localStorage.getItem(checkinKey(tripId));
        return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
        return new Set();
    }
}

function saveCheckins(tripId: string, set: Set<string>) {
    localStorage.setItem(checkinKey(tripId), JSON.stringify([...set]));
}

function actKey(dayIdx: number, actIdx: number) {
    return `${dayIdx}_${actIdx}`;
}

function todLabel(time: string): { label: string; emoji: string; color: string } {
    const t = (time || '').toLowerCase();
    const h = t.match(/^(\d{1,2}):/)?.[1];
    const hour = h ? parseInt(h) : -1;

    if (t.includes('pagi') || t.includes('morning') || (hour >= 5 && hour < 11))
        return { label: 'PAGI', emoji: '🌤️', color: '#60A5FA' };
    if (t.includes('siang') || t.includes('afternoon') || (hour >= 11 && hour < 15))
        return { label: 'SIANG', emoji: '☀️', color: '#FBBF24' };
    if (t.includes('sore') || t.includes('evening') || (hour >= 15 && hour < 18))
        return { label: 'SORE', emoji: '🌇', color: '#F97316' };
    if (t.includes('malam') || t.includes('night') || hour >= 18)
        return { label: 'MALAM', emoji: '🌙', color: '#A78BFA' };
    return { label: time, emoji: '📍', color: 'rgba(255,255,255,0.5)' };
}

// ─── Map placeholder view ──────────────────────────────────────────────────────

function MapView({ activities, dayIdx }: { activities: Activity[]; dayIdx: number }) {
    return (
        <div className="relative flex-1 flex flex-col items-center justify-center" style={{ background: '#0A1A14', minHeight: 400 }}>
            {/* Grid lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                {[30, 45, 60].map(y => (
                    <div key={y} className="absolute w-full" style={{ top: `${y}%`, height: 1, background: '#0D9488' }} />
                ))}
                {[30, 60].map(x => (
                    <div key={x} className="absolute h-full" style={{ left: `${x}%`, width: 1, background: '#0D9488' }} />
                ))}
            </div>
            {/* Pins */}
            {activities.slice(0, 5).map((act, i) => {
                const positions = [
                    { top: '35%', left: '38%' },
                    { top: '42%', left: '52%' },
                    { top: '55%', left: '44%' },
                    { top: '48%', left: '65%' },
                    { top: '62%', left: '57%' },
                ];
                const pos = positions[i] || { top: `${40 + i * 5}%`, left: `${40 + i * 5}%` };
                return (
                    <div key={i} className="absolute flex items-center justify-center w-7 h-7 rounded-full text-white text-xs font-bold"
                        style={{ ...pos, background: '#0D9488', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                        {i + 1}
                    </div>
                );
            })}
            <p className="text-white/20 text-xs mt-auto mb-3">Peta placeholder</p>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface Props {
    data: TripResponse;
}

type TabView = 'activities' | 'map';

export default function TravelModeView({ data }: Props) {
    const router = useRouter();
    const { trip, plan } = data;
    const tripId = trip.id;
    const destination = trip.destination;
    const itinerary: ItineraryItem[] = plan?.itinerary ?? [];

    const todayIdx = getTodayDayIndex(trip.start_date);
    const activeDayIdx = Math.min(todayIdx, Math.max(0, itinerary.length - 1));

    const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set());
    const [listExpanded, setListExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<TabView>('activities');

    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        setCheckedIn(loadCheckins(tripId));
        setHydrated(true);
    }, [tripId]);

    // Persist to localStorage outside the updater — safe under StrictMode double-invoke
    useEffect(() => {
        if (!hydrated) return;
        saveCheckins(tripId, checkedIn);
    }, [checkedIn, tripId, hydrated]);

    const toggleCheckin = useCallback((key: string) => {
        setCheckedIn(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    }, []);

    const currentDay = itinerary[activeDayIdx];
    const activities = currentDay?.activities ?? [];

    // SEKARANG = first non-checked activity
    const nowIdx = activities.findIndex((_, i) => !checkedIn.has(actKey(activeDayIdx, i)));
    const nowActivity = nowIdx >= 0 ? activities[nowIdx] : null;

    // BERIKUTNYA = second non-checked activity
    const nextIdx = activities.findIndex((_, i) => i > nowIdx && !checkedIn.has(actKey(activeDayIdx, i)));
    const nextActivity = nextIdx >= 0 ? activities[nextIdx] : null;

    // Progress
    const totalActs = activities.length;
    const doneActs = activities.filter((_, i) => checkedIn.has(actKey(activeDayIdx, i))).length;
    const progressPct = totalActs > 0 ? Math.round((doneActs / totalActs) * 100) : 0;

    // Date label
    const dateLabel = (() => {
        if (!trip.start_date) return '';
        const d = new Date(trip.start_date);
        d.setDate(d.getDate() + activeDayIdx);
        return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    })();

    return (
        <div className="min-h-screen flex flex-col" style={{ background: '#07111F', fontFamily: 'var(--font-sans)' }}>
            <div className="max-w-md mx-auto w-full flex flex-col min-h-screen relative">

                {/* ── HEADER ──────────────────────────────────────────────── */}
                <div className="px-[1.1rem] pt-[1.1rem] pb-3" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] font-semibold tracking-[1.2px] mb-[3px]" style={{ color: '#0D9488' }}>
                                TRAVEL MODE
                            </p>
                            <p className="text-[20px] font-bold text-white leading-tight mb-[2px]">
                                {plan?.tagline || destination}
                            </p>
                            <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Hari {activeDayIdx + 1} dari {itinerary.length}{dateLabel ? ` · ${dateLabel}` : ''}
                            </p>
                        </div>
                        <button
                            onClick={() => router.push(`/trips/${tripId}`)}
                            className="mt-[2px] rounded-lg text-[10px] px-[10px] py-[5px] whitespace-nowrap transition-colors hover:bg-white/10"
                            style={{
                                background: 'rgba(255,255,255,0.06)',
                                color: 'rgba(255,255,255,0.4)',
                                border: '0.5px solid rgba(255,255,255,0.1)',
                            }}
                        >
                            Keluar
                        </button>
                    </div>
                </div>

                {/* ── PROGRESS BAR ────────────────────────────────────────── */}
                <div className="px-[1.1rem] py-[0.65rem]" style={{ borderBottom: '0.5px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex justify-between items-center mb-[6px]">
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Aktivitas{' '}
                            <span className="text-white font-semibold">{doneActs}</span>{' '}
                            dari {totalActs} hari ini
                        </p>
                        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {totalActs - doneActs} lagi
                        </p>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%`, background: '#0D9488' }}
                        />
                    </div>
                </div>

                {/* ── CONTENT AREA ────────────────────────────────────────── */}
                {activeTab === 'activities' ? (
                    <div className="flex-1 overflow-y-auto pb-20 px-4 pt-4 space-y-4">

                        {/* SEKARANG */}
                        {nowActivity ? (
                            <>
                                <p className="text-[10px] font-semibold tracking-[1px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    SEKARANG
                                </p>
                                <HeroCard
                                    activity={nowActivity}
                                    destination={destination}
                                    dayIdx={activeDayIdx}
                                    actIdx={nowIdx}
                                    onCheckin={toggleCheckin}
                                    isChecked={checkedIn.has(actKey(activeDayIdx, nowIdx))}
                                />
                            </>
                        ) : (
                            <div className="rounded-2xl py-8 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                                <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Semua aktivitas selesai 🎉</p>
                            </div>
                        )}

                        {/* BERIKUTNYA */}
                        {nextActivity && (
                            <>
                                <p className="text-[10px] font-semibold tracking-[1px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                                    BERIKUTNYA
                                </p>
                                <NextCard activity={nextActivity} destination={destination} />
                            </>
                        )}

                        {/* Semua aktivitas hari ini — collapsible */}
                        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                            <button
                                className="w-full flex items-center justify-between px-4 py-[0.85rem] text-left"
                                onClick={() => setListExpanded(v => !v)}
                            >
                                <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                                    Semua aktivitas hari ini
                                </p>
                                {listExpanded
                                    ? <ChevronUp className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                                    : <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.35)' }} />
                                }
                            </button>

                            {listExpanded && (
                                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.07)' }}>
                                    {activities.map((act, i) => {
                                        const key = actKey(activeDayIdx, i);
                                        const done = checkedIn.has(key);
                                        const isNow = i === nowIdx;
                                        const tod = todLabel(act.time);

                                        return (
                                            <div
                                                key={i}
                                                className="flex items-center gap-[10px] px-4 py-3"
                                                style={{
                                                    borderBottom: i < activities.length - 1 ? '0.5px solid rgba(255,255,255,0.05)' : 'none',
                                                    background: isNow ? 'rgba(13,148,136,0.08)' : 'transparent',
                                                    opacity: done ? 0.5 : 1,
                                                }}
                                            >
                                                {/* Circle indicator */}
                                                <button
                                                    onClick={() => toggleCheckin(key)}
                                                    className="flex-shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center transition-colors"
                                                    style={{
                                                        background: done ? '#0D9488' : isNow ? '#0D9488' : 'rgba(255,255,255,0.1)',
                                                    }}
                                                    aria-label={done ? 'Batalkan check-in' : 'Check in'}
                                                >
                                                    {done ? (
                                                        <CheckCircle2 className="w-[13px] h-[13px] text-white" />
                                                    ) : isNow ? (
                                                        <span className="text-[11px] font-bold text-white">{i + 1}</span>
                                                    ) : (
                                                        <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{i + 1}</span>
                                                    )}
                                                </button>

                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className="text-[13px] font-medium leading-tight"
                                                        style={{
                                                            color: done ? 'rgba(255,255,255,0.5)' : 'white',
                                                            textDecoration: done ? 'line-through' : 'none',
                                                        }}
                                                    >
                                                        {act.place_name || act.activity}
                                                    </p>
                                                    <p className="text-[11px] mt-[1px]" style={{ color: isNow ? '#0D9488' : 'rgba(255,255,255,0.4)' }}>
                                                        {tod.emoji} {tod.label}{isNow ? ' · Sekarang' : done ? ' · Selesai' : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* MAP TAB */
                    <div className="flex-1 relative overflow-hidden">
                        <MapView activities={activities} dayIdx={activeDayIdx} />
                    </div>
                )}

                {/* ── BOTTOM NAV ──────────────────────────────────────────── */}
                <div
                    className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex z-20"
                    style={{ background: 'rgba(7,17,31,0.97)', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}
                >
                    {([
                        { tab: 'activities' as TabView, label: 'Aktivitas', Icon: List },
                        { tab: 'map' as TabView, label: 'Peta', Icon: Map },
                    ] as const).map(({ tab, label, Icon }) => {
                        const active = activeTab === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="flex-1 flex flex-col items-center gap-1 py-[13px] pb-[14px] transition-colors"
                            >
                                <Icon className="w-5 h-5" style={{ color: active ? '#0D9488' : 'rgba(255,255,255,0.35)' }} />
                                <span
                                    className="text-[10px] tracking-[0.3px]"
                                    style={{
                                        color: active ? '#0D9488' : 'rgba(255,255,255,0.35)',
                                        fontWeight: active ? 600 : 400,
                                    }}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}

// ─── Hero card — SEKARANG ────────────────────────────────────────────────────

function HeroCard({
    activity,
    destination,
    dayIdx,
    actIdx,
    onCheckin,
    isChecked,
}: {
    activity: Activity;
    destination: string;
    dayIdx: number;
    actIdx: number;
    onCheckin: (key: string) => void;
    isChecked: boolean;
}) {
    const mapsUrl = getMapsUrl(activity, destination);
    const tod = todLabel(activity.time);

    return (
        <div
            className="rounded-2xl overflow-hidden relative flex flex-col justify-end cursor-default"
            style={{ minHeight: 220 }}
        >
            {/* Background */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0A2818 0%, #061510 100%)' }} />
            {/* Gradient overlay for text legibility */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(7,17,31,0.97) 0%, rgba(7,17,31,0.5) 55%, rgba(7,17,31,0.1) 100%)' }} />

            {/* Content */}
            <div className="relative p-[1.1rem]">
                <div className="flex items-center gap-[6px] mb-1">
                    <span className="text-[16px]">{tod.emoji}</span>
                    <span
                        className="text-[10px] font-bold tracking-[1px]"
                        style={{ color: tod.color }}
                    >
                        {tod.label}
                    </span>
                </div>
                <p className="text-white text-[20px] font-bold leading-[1.25] mb-1">
                    {activity.place_name || activity.activity}
                </p>
                {activity.place_name && activity.place_name !== activity.activity && (
                    <p className="text-[12px] mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {activity.activity}
                    </p>
                )}
                {(activity.address || activity.description_short) && (
                    <p className="text-[12px] mb-3 line-clamp-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {activity.address || activity.description_short}
                    </p>
                )}

                <div className="flex gap-2">
                    <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 text-white text-[15px] font-semibold py-3 rounded-xl transition-colors hover:brightness-110"
                        style={{ background: '#0D9488', borderRadius: 12 }}
                    >
                        <MapPin className="w-[17px] h-[17px]" />
                        Buka Maps
                    </a>
                    <button
                        onClick={() => onCheckin(actKey(dayIdx, actIdx))}
                        className="flex items-center justify-center w-12 rounded-xl transition-colors hover:brightness-110"
                        style={{
                            background: isChecked ? 'rgba(13,148,136,0.3)' : 'rgba(255,255,255,0.1)',
                            border: '0.5px solid rgba(255,255,255,0.15)',
                        }}
                        aria-label={isChecked ? 'Batalkan check-in' : 'Check in selesai'}
                    >
                        <CheckCircle2
                            className="w-5 h-5"
                            style={{ color: isChecked ? '#0D9488' : 'rgba(255,255,255,0.4)' }}
                        />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── "BERIKUTNYA" card ────────────────────────────────────────────────────────

function NextCard({ activity, destination }: { activity: Activity; destination: string }) {
    const mapsUrl = getMapsUrl(activity, destination);
    const tod = todLabel(activity.time);

    return (
        <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl p-4 transition-colors hover:brightness-105"
            style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)' }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                style={{ background: 'rgba(249,115,22,0.15)' }}
            >
                {tod.emoji}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[6px] mb-[3px]">
                    <span
                        className="text-[10px] font-bold tracking-[0.8px]"
                        style={{ color: tod.color }}
                    >
                        {tod.label}
                    </span>
                </div>
                <p className="text-[15px] font-semibold text-white truncate leading-tight">
                    {activity.place_name || activity.activity}
                </p>
                <p className="text-[11px] mt-[2px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {activity.transit_time ? `~${activity.transit_time} dari sini` : activity.description_short || ''}
                </p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </a>
    );
}
