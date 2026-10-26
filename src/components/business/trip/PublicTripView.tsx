'use client';

import React, { useState } from 'react';
import { TripResponse } from '@/types';
import { Lock, Sparkles, Share2 } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface PublicTripViewProps {
    data: TripResponse;
}

function fmtRupiah(n: number): string {
    if (!n) return '—';
    return `Rp ${n.toLocaleString('id-ID')}`;
}

function todLabel(time: string): string {
    const t = (time || '').toLowerCase();
    if (t.includes('pagi') || t.includes('morning')) return 'Pagi';
    if (t.includes('siang') || t.includes('afternoon') || t.includes('noon')) return 'Siang';
    if (t.includes('sore') || t.includes('evening')) return 'Sore';
    if (t.includes('malam') || t.includes('night')) return 'Malam';
    const match = t.match(/^(\d{1,2}):/);
    if (match) {
        const h = parseInt(match[1]);
        if (h < 11) return 'Pagi';
        if (h < 15) return 'Siang';
        if (h < 18) return 'Sore';
        return 'Malam';
    }
    return time;
}

export default function PublicTripView({ data }: PublicTripViewProps) {
    const { trip, plan } = data;
    const [selectedDay, setSelectedDay] = useState(0);

    // Gating: Day 1 window = within 24h of creation.
    // Missing or invalid created_at → treat as within window (all days open).
    const createdAtRaw = trip.created_at ? new Date(trip.created_at) : null;
    const createdAt = createdAtRaw && !isNaN(createdAtRaw.getTime()) ? createdAtRaw : null;
    const isDay1Window = createdAt
        ? Date.now() - createdAt.getTime() < 24 * 60 * 60 * 1000
        : true;

    const itinerary = plan?.itinerary || [];

    // Date range display
    const startDateObj = trip.start_date ? new Date(trip.start_date) : null;
    let dateChip = '';
    if (startDateObj && !isNaN(startDateObj.getTime())) {
        const s = formatDate(startDateObj);
        if (trip.trip_days > 1) {
            const end = new Date(startDateObj);
            end.setDate(startDateObj.getDate() + trip.trip_days - 1);
            dateChip = `${s}–${formatDate(end)}`;
        } else {
            dateChip = s;
        }
    }

    const styleLabel = trip.style
        ? trip.style.charAt(0).toUpperCase() + trip.style.slice(1).toLowerCase()
        : '';

    const destination = trip.destination || '';

    const handleShare = () => {
        if (typeof window === 'undefined') return;
        navigator.clipboard.writeText(window.location.href).then(() => {
            toast.success('Link disalin!');
        });
    };

    const destParam = destination ? `?destination=${encodeURIComponent(destination)}` : '';
    const signUpUrl = `/sign-up?redirect=${encodeURIComponent(`/dashboard${destParam}`)}`;

    const bd = plan?.budget_breakdown;
    const budgetItems = bd ? [
        { label: 'Transport', value: bd.transport },
        { label: 'Akomodasi', value: bd.accommodation },
        { label: 'Makan', value: bd.food },
        { label: 'Total', value: (bd.transport || 0) + (bd.accommodation || 0) + (bd.food || 0) + (bd.tickets || 0) + (bd.misc || 0), isTotal: true },
    ] : null;

    const currentDayPlan = itinerary[selectedDay];
    // Gating based on actual day ordinal, not array index — defensive against unordered API responses
    const isDayVisible = (currentDayPlan?.day ?? 1) === 1 || isDay1Window;

    return (
        <div className="min-h-screen bg-zinc-50 font-sans pb-16">
            <div className="max-w-[480px] mx-auto px-4">

                {/* ── HERO HEADER ── */}
                <div className="relative rounded-2xl overflow-hidden mb-5 mt-4 bg-zinc-950 min-h-[220px] flex flex-col justify-end p-6">
                    {/* MIRU pill top-right */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 border border-white/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span className="text-white text-[11px] font-bold tracking-[1.5px]">MIRU</span>
                    </div>

                    {/* Share button top-left */}
                    <button
                        onClick={handleShare}
                        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 text-white text-[11px] font-semibold hover:bg-white/25 transition-colors border border-white/20"
                    >
                        <Share2 className="w-3 h-3" />
                        Bagikan
                    </button>

                    <div className="relative z-10">
                        <p className="text-zinc-400 text-[11px] font-semibold tracking-[1.5px] uppercase mb-1.5">Trip itinerary</p>
                        <h1 className="text-white text-[28px] font-bold tracking-tight leading-tight mb-2">{destination || 'Destinasi'}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            {dateChip && <span className="text-zinc-300 text-[13px]">{dateChip}</span>}
                            {dateChip && trip.trip_days > 0 && <span className="text-zinc-600">·</span>}
                            {trip.trip_days > 0 && <span className="text-zinc-300 text-[13px]">{trip.trip_days} hari</span>}
                            {styleLabel && <><span className="text-zinc-600">·</span><span className="text-zinc-300 text-[13px]">{styleLabel}</span></>}
                        </div>
                    </div>
                </div>

                {/* ── INVITATION BANNER ── */}
                <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl mb-5 bg-white border border-zinc-200 shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-zinc-950 leading-tight">Seseorang berbagi trip ini</p>
                        <p className="text-[12px] text-zinc-500">Lihat rencana perjalanan{destination ? ` ke ${destination}` : ''}</p>
                    </div>
                    <Link
                        href={signUpUrl}
                        className="bg-zinc-950 text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-zinc-800 transition-colors flex-shrink-0"
                    >
                        Buat tripku ↗
                    </Link>
                </div>

                {/* ── DAY TABS + ITINERARY ── */}
                {itinerary.length > 0 && (
                    <div className="mb-5">
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                            {itinerary.map((day, idx) => (
                                <button
                                    key={day.day}
                                    onClick={() => setSelectedDay(idx)}
                                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors ${
                                        idx === selectedDay
                                            ? 'bg-zinc-950 text-white'
                                            : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                                    }`}
                                >
                                    Hari {day.day}
                                </button>
                            ))}
                        </div>

                        {currentDayPlan && (
                            <>
                                <p className="text-[11px] font-bold text-zinc-400 mb-3 tracking-[0.5px] uppercase">
                                    {currentDayPlan.title
                                        ? `${currentDayPlan.title} · ${currentDayPlan.activities?.length || 0} aktivitas`
                                        : `Hari ${currentDayPlan.day} · ${currentDayPlan.activities?.length || 0} aktivitas`}
                                </p>

                                {isDayVisible ? (
                                    <div className="flex flex-col gap-2.5">
                                        {(currentDayPlan.activities || []).map((act, i) => (
                                            <div
                                                key={i}
                                                className="relative flex gap-3 items-start p-4 rounded-xl bg-white border border-zinc-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-[18px]">
                                                    {act.type === 'food' || act.type === 'kuliner' ? '🍜'
                                                        : act.type === 'landmark' || act.type === 'wisata' ? '🏛️'
                                                        : act.type === 'nature' ? '🌿'
                                                        : '📍'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="text-[14px] font-bold text-zinc-950 leading-snug">{act.activity}</p>
                                                        <span className="text-[11px] font-medium text-zinc-400 whitespace-nowrap flex-shrink-0">{todLabel(act.time)}</span>
                                                    </div>
                                                    {(act.description_short || act.description) && (
                                                        <p className="text-[12px] text-zinc-500 mt-0.5 line-clamp-2">
                                                            {act.description_short || act.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Hidden gem blur overlay — always gated */}
                                                {act.is_hidden_gem && (
                                                    <div className="absolute inset-0 rounded-xl flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
                                                        <div className="flex items-center gap-1.5 bg-zinc-950 px-4 py-1.5 rounded-full shadow-sm">
                                                            <Lock className="w-3 h-3 text-teal-400" />
                                                            <span className="text-[12px] font-semibold text-white">Hidden gem · PRO</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center rounded-xl bg-white border border-zinc-200">
                                        <Lock className="w-5 h-5 text-zinc-400 mx-auto mb-2" />
                                        <p className="text-[13px] text-zinc-500 mb-3">
                                            Buat akun untuk lihat hari {currentDayPlan.day}
                                        </p>
                                        <Link
                                            href={signUpUrl}
                                            className="inline-flex items-center text-[12px] font-semibold text-white bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Daftar gratis →
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ── BUDGET SECTION ── */}
                {budgetItems && (
                    <div className="rounded-xl p-4 mb-4 bg-white border border-zinc-200">
                        <p className="text-[11px] font-bold text-zinc-400 tracking-[1.5px] uppercase mb-3">ESTIMASI BUDGET</p>
                        <div className="grid grid-cols-2 gap-2">
                            {budgetItems.map(item => (
                                <div
                                    key={item.label}
                                    className={`rounded-lg px-3 py-2.5 ${
                                        item.isTotal
                                            ? 'bg-zinc-950 text-white'
                                            : 'bg-zinc-50 border border-zinc-200 text-zinc-950'
                                    }`}
                                >
                                    <p className={`text-[11px] mb-0.5 ${item.isTotal ? 'text-zinc-400' : 'text-zinc-500'}`}>{item.label}</p>
                                    <p className="text-[14px] font-bold">{fmtRupiah(item.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CTA FOOTER ── */}
                <div className="rounded-2xl p-6 text-center bg-zinc-950 text-white">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-[15px] font-bold mb-1.5">Rencanakan tripmu sendiri</p>
                    <p className="text-zinc-400 text-[13px] mb-4">Miru generate itinerary lengkap dalam hitungan detik</p>
                    <Link
                        href={signUpUrl}
                        className="block w-full bg-white hover:bg-zinc-100 text-zinc-950 text-[14px] font-bold py-3 rounded-xl transition-colors"
                    >
                        Mulai gratis ↗
                    </Link>
                </div>

            </div>
        </div>
    );
}
