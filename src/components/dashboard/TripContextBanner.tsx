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
            <div className="relative bg-white rounded-2xl p-5 overflow-hidden border border-zinc-200 shadow-sm">
                <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-200/60 rounded-full px-2.5 py-0.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider">Trip berikutnya</span>
                </div>
                <p className="text-zinc-950 text-xl font-bold leading-tight mb-1">{trip!.destination}</p>
                <p className="text-zinc-600 text-[13px] font-medium mb-4">
                    {startLabel} · {daysUntil} hari lagi
                </p>
                <div className="flex gap-2.5">
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-semibold rounded-xl py-3 text-center transition-colors"
                    >
                        Lihat rencana
                    </Link>
                    <button
                        onClick={handleShare}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[13px] font-semibold rounded-xl px-4 py-3 border border-zinc-200 transition-colors"
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
            <div className="relative bg-zinc-950 rounded-2xl p-5 overflow-hidden border border-zinc-900">
                <p className="text-[11px] font-bold text-teal-400 uppercase tracking-wider mb-1">Besok berangkat</p>
                <p className="text-white text-xl font-bold leading-tight mb-1">{trip!.destination}</p>
                <p className="text-zinc-400 text-[13px] mb-4">Aktifkan Travel Mode untuk hari H</p>
                <div className="flex gap-2.5">
                    <button
                        onClick={() => router.push(`/trips/${trip!.id}?mode=travel`)}
                        className="flex-1 bg-white hover:bg-zinc-100 text-zinc-950 text-[13px] font-bold rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <Plane className="w-4 h-4" />
                        Aktifkan Travel Mode
                    </button>
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="bg-white/10 hover:bg-white/15 text-white text-[13px] font-semibold rounded-xl px-4 py-3 border border-white/15 transition-colors"
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
            <div className="relative bg-zinc-950 rounded-2xl p-5 overflow-hidden border border-zinc-900">
                <div className="inline-flex items-center gap-1.5 bg-teal-500/20 border border-teal-500/30 rounded-full px-2.5 py-0.5 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">Sedang berjalan</span>
                </div>
                <p className="text-white text-xl font-bold leading-tight mb-1">{trip!.destination}</p>
                <p className="text-zinc-400 text-[13px] mb-4">Perjalananmu dimulai hari ini!</p>
                <div className="flex gap-2.5">
                    <Link
                        href={`/trips/${trip!.id}?mode=travel`}
                        className="flex-1 bg-teal-600 hover:bg-teal-500 text-white text-[13px] font-bold rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        <MapPin className="w-4 h-4" />
                        Buka Travel Mode
                    </Link>
                </div>
            </div>
        );
    }

    // ── State: POST-TRIP ─────────────────────────────────────────────────────
    if (state === 'post_trip') {
        return (
            <div className="relative bg-white rounded-2xl p-5 overflow-hidden border border-zinc-200 shadow-sm">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Perjalanan selesai</p>
                <p className="text-zinc-950 text-xl font-bold leading-tight mb-1">{trip!.destination}</p>
                <p className="text-zinc-600 text-[13px] mb-4">Lihat kembali rute perjalananmu atau mulai petualangan baru</p>
                <div className="flex gap-2.5">
                    <Link
                        href={`/trips/${trip!.id}`}
                        className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white text-[13px] font-semibold rounded-xl py-3 flex items-center justify-center gap-1.5 transition-colors"
                    >
                        Lihat Detail Trip
                    </Link>
                    <Link
                        href="/explore"
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-[13px] font-semibold rounded-xl px-4 py-3 border border-zinc-200 transition-colors"
                    >
                        Eksplor Lagi
                    </Link>
                </div>
            </div>
        );
    }

    return null;
}
