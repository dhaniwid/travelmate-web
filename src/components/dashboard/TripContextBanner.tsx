'use client';

import React from 'react';
import { Trip } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plane, MapPin, Trophy } from 'lucide-react';

type BannerState = 'pre_trip' | 'eve' | 'today' | 'post_trip' | 'empty';

interface BannerData {
    state: BannerState;
    trip: Trip | null;
    daysUntil: number;
}

function getTodayStr() {
    return new Date().toISOString().split('T')[0];
}

function parseDate(dateStr: string) {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
}

function getDaysDiff(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = parseDate(dateStr);
    return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function computeEndDate(trip: Trip): string {
    if (!trip.start_date) return '';
    const start = parseDate(trip.start_date);
    start.setDate(start.getDate() + (trip.trip_days - 1));
    return start.toISOString().split('T')[0];
}

export function resolveBannerData(trips: Trip[]): BannerData {
    const today = getTodayStr();

    const todayTrip = trips.find(t => {
        if (!t.start_date) return false;
        const end = computeEndDate(t);
        return t.start_date <= today && today <= end;
    });
    if (todayTrip) return { state: 'today', trip: todayTrip, daysUntil: 0 };

    const eveTrip = trips.find(t => t.start_date && getDaysDiff(t.start_date) === 1);
    if (eveTrip) return { state: 'eve', trip: eveTrip, daysUntil: 1 };

    const upcoming = trips
        .filter(t => t.start_date && getDaysDiff(t.start_date) > 1)
        .sort((a, b) => getDaysDiff(a.start_date!) - getDaysDiff(b.start_date!));
    if (upcoming.length > 0) {
        return { state: 'pre_trip', trip: upcoming[0], daysUntil: getDaysDiff(upcoming[0].start_date!) };
    }

    const past = trips
        .filter(t => {
            if (!t.start_date) return false;
            const end = computeEndDate(t);
            return end < today;
        })
        .sort((a, b) => computeEndDate(b).localeCompare(computeEndDate(a)));
    if (past.length > 0) return { state: 'post_trip', trip: past[0], daysUntil: 0 };

    return { state: 'empty', trip: null, daysUntil: 0 };
}

interface Props {
    trips: Trip[];
    onTripUpdated?: (tripId: string, patch: Partial<Trip>) => void;
}

export default function TripContextBanner({ trips, onTripUpdated }: Props) {
    const router = useRouter();

    const { state, trip, daysUntil } = resolveBannerData(trips);

    if (state === 'empty') return null;

    const handleShare = () => {
        if (!trip) return;
        const url = `${window.location.origin}/trips/${trip.id}`;
        if (navigator.share) {
            navigator.share({ title: trip.destination, url });
        } else {
            navigator.clipboard?.writeText(url);
        }
    };

    // ── State: PRE-TRIP ──────────────────────────────────────────────────────
    if (state === 'pre_trip') {
        const startLabel = trip?.start_date
            ? new Date(trip.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            : '';
        return (
            <div className="relative bg-[#0A1628] rounded-2xl p-5 overflow-hidden border border-white/5">
                {/* Decorative circle */}
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-teal-500/10 translate-x-8 -translate-y-8" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.8px] mb-1">Trip berikutnya</p>
                <p className="text-white text-[17px] font-medium leading-tight mb-1">{trip!.destination}</p>
                <p className="text-slate-400 text-[13px] mb-4">
                    {startLabel} · {daysUntil} hari lagi
                </p>
                <div className="flex gap-2">
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="flex-1 bg-teal-500 hover:bg-teal-400 text-white text-[13px] font-medium rounded-xl py-3 text-center transition-colors"
                    >
                        Lihat rencana
                    </Link>
                    <button
                        onClick={handleShare}
                        className="bg-white/8 hover:bg-white/12 text-white text-[13px] rounded-xl px-4 py-3 border border-white/8 transition-colors"
                    >
                        Bagikan
                    </button>
                </div>
            </div>
        );
    }

    // ── State: EVE (H-1) ─────────────────────────────────────────────────────
    if (state === 'eve') {
        return (
            <div className="relative bg-[#1A0A28] rounded-2xl p-5 overflow-hidden border border-orange-500/15">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-orange-500/10 translate-x-8 -translate-y-8" />
                <p className="text-[11px] font-semibold text-orange-400 uppercase tracking-[0.8px] mb-1">Besok berangkat</p>
                <p className="text-white text-[17px] font-medium leading-tight mb-1">{trip!.destination}</p>
                <p className="text-slate-400 text-[13px] mb-4">Aktifkan Travel Mode untuk hari H</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/trips/${trip!.id}?mode=travel`)}
                        className="flex-1 bg-orange-500 hover:bg-orange-400 text-white text-[13px] font-medium rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Plane className="w-3.5 h-3.5" />
                        Aktifkan Travel Mode
                    </button>
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="bg-white/8 hover:bg-white/12 text-white text-[13px] rounded-xl px-4 py-3 border border-white/8 transition-colors"
                    >
                        Cek rencana
                    </Link>
                </div>
            </div>
        );
    }

    // ── State: HARI H ────────────────────────────────────────────────────────
    if (state === 'today') {
        return (
            <div className="relative bg-[#0A2818] rounded-2xl p-5 overflow-hidden border border-teal-500/20">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-teal-500/10 translate-x-8 -translate-y-8" />
                <p className="text-[11px] font-semibold text-teal-400 uppercase tracking-[0.8px] mb-1">Sedang berjalan</p>
                <p className="text-white text-[17px] font-medium leading-tight mb-1">{trip!.destination}</p>
                <p className="text-slate-400 text-[13px] mb-4">Perjalananmu dimulai hari ini!</p>
                <div className="flex gap-2">
                    <Link
                        href={`/trips/${trip!.id}?mode=travel`}
                        className="flex-1 bg-teal-500 hover:bg-teal-400 text-white text-[13px] font-medium rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <MapPin className="w-3.5 h-3.5" />
                        Buka Travel Mode
                    </Link>
                    <Link
                        href="/sumi"
                        className="bg-white/8 hover:bg-white/12 text-white text-[13px] rounded-xl px-4 py-3 border border-white/8 transition-colors"
                    >
                        Claim stamp
                    </Link>
                </div>
            </div>
        );
    }

    // ── State: POST-TRIP ─────────────────────────────────────────────────────
    if (state === 'post_trip') {
        return (
            <div className="relative bg-[#0A1628] rounded-2xl p-5 overflow-hidden border border-violet-500/15">
                <div className="absolute top-0 right-0 w-28 h-28 rounded-full bg-violet-500/10 translate-x-8 -translate-y-8" />
                <p className="text-[11px] font-semibold text-violet-400 uppercase tracking-[0.8px] mb-1">Perjalanan selesai</p>
                <p className="text-white text-[17px] font-medium leading-tight mb-1">{trip!.destination}</p>
                <p className="text-slate-400 text-[13px] mb-4">Bagikan kenangan atau buat trip baru</p>
                <div className="flex gap-2">
                    <Link
                        href="/sumi"
                        className="flex-1 bg-violet-500 hover:bg-violet-400 text-white text-[13px] font-medium rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Trophy className="w-3.5 h-3.5" />
                        Lihat Passport Sumi
                    </Link>
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="bg-white/8 hover:bg-white/12 text-white text-[13px] rounded-xl px-4 py-3 border border-white/8 transition-colors"
                    >
                        Kenangan
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
