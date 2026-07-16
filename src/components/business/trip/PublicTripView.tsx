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
        <div className="min-h-screen bg-[#060F1E] font-sans pb-16">
            <div className="max-w-[480px] mx-auto px-4">

                {/* ── HERO HEADER ── */}
                <div
                    className="relative rounded-2xl overflow-hidden mb-5 mt-4"
                    style={{ background: '#0A1628', minHeight: 220, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '1.5rem' }}
                >
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,22,40,0.2) 0%, rgba(10,22,40,0.85) 100%)', zIndex: 1 }} />

                    {/* MIRU pill top-right */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1" style={{ border: '0.5px solid rgba(255,255,255,0.2)' }}>
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                        <span className="text-white text-[11px] font-medium tracking-[1.5px]">MIRU</span>
                    </div>

                    {/* Share button top-left */}
                    <button
                        onClick={handleShare}
                        className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-white/15 backdrop-blur-md rounded-full px-3 py-1 text-white text-[11px] font-medium hover:bg-white/25 transition-colors"
                        style={{ border: '0.5px solid rgba(255,255,255,0.2)' }}
                    >
                        <Share2 className="w-3 h-3" />
                        Bagikan
                    </button>

                    <div className="relative z-10">
                        <p className="text-white/60 text-[11px] tracking-[1.5px] uppercase mb-1.5">Trip itinerary</p>
                        <h1 className="text-white text-[28px] font-medium leading-tight mb-2">{destination || 'Destinasi'}</h1>
                        <div className="flex items-center gap-3 flex-wrap">
                            {dateChip && <span className="text-white/75 text-[13px]">{dateChip}</span>}
                            {dateChip && trip.trip_days > 0 && <span className="text-white/30">·</span>}
                            {trip.trip_days > 0 && <span className="text-white/75 text-[13px]">{trip.trip_days} hari</span>}
                            {styleLabel && <><span className="text-white/30">·</span><span className="text-white/75 text-[13px]">{styleLabel}</span></>}
                        </div>
                    </div>
                </div>

                {/* ── INVITATION BANNER ── */}
                <div
                    className="flex items-center gap-[10px] px-4 py-3 rounded-xl mb-5"
                    style={{ background: 'rgba(13,148,136,0.1)', border: '0.5px solid rgba(13,148,136,0.3)' }}
                >
                    <div className="w-8 h-8 rounded-full bg-[#0D9488] flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white leading-tight">Seseorang berbagi trip ini</p>
                        <p className="text-[12px] text-white/50">Lihat rencana perjalanan{destination ? ` ke ${destination}` : ''}</p>
                    </div>
                    <Link
                        href={signUpUrl}
                        className="bg-[#0D9488] text-white text-[12px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-teal-600 transition-colors flex-shrink-0"
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
                                    className="flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors"
                                    style={
                                        idx === selectedDay
                                            ? { background: '#0D9488', color: 'white', border: 'none' }
                                            : { background: '#0D2040', color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.1)' }
                                    }
                                >
                                    Hari {day.day}
                                </button>
                            ))}
                        </div>

                        {currentDayPlan && (
                            <>
                                <p className="text-[12px] text-white/40 mb-3 tracking-[0.5px] uppercase">
                                    {currentDayPlan.title
                                        ? `${currentDayPlan.title} · ${currentDayPlan.activities?.length || 0} aktivitas`
                                        : `Hari ${currentDayPlan.day} · ${currentDayPlan.activities?.length || 0} aktivitas`}
                                </p>

                                {isDayVisible ? (
                                    <div className="flex flex-col gap-3">
                                        {(currentDayPlan.activities || []).map((act, i) => (
                                            <div
                                                key={i}
                                                className="relative flex gap-3 items-start p-4 rounded-xl"
                                                style={{
                                                    background: '#0A1628',
                                                    border: '0.5px solid rgba(255,255,255,0.08)',
                                                    opacity: act.is_hidden_gem ? 0.5 : 1,
                                                }}
                                            >
                                                <div
                                                    className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 text-[18px]"
                                                    style={{ background: 'rgba(13,148,136,0.2)' }}
                                                >
                                                    {act.type === 'food' || act.type === 'kuliner' ? '🍜'
                                                        : act.type === 'landmark' || act.type === 'wisata' ? '🏛️'
                                                        : act.type === 'nature' ? '🌿'
                                                        : '📍'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <p className="text-[14px] font-medium text-white leading-snug">{act.activity}</p>
                                                        <span className="text-[11px] text-white/40 whitespace-nowrap flex-shrink-0">{todLabel(act.time)}</span>
                                                    </div>
                                                    {(act.description_short || act.description) && (
                                                        <p className="text-[12px] text-white/50 mt-0.5 line-clamp-2">
                                                            {act.description_short || act.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Hidden gem blur overlay — always gated */}
                                                {act.is_hidden_gem && (
                                                    <div
                                                        className="absolute inset-0 rounded-xl flex items-center justify-center"
                                                        style={{ background: 'rgba(13,32,64,0.7)', backdropFilter: 'blur(2px)' }}
                                                    >
                                                        <div className="flex items-center gap-1.5 bg-[#0D9488] px-4 py-1.5 rounded-full">
                                                            <Lock className="w-3 h-3 text-white" />
                                                            <span className="text-[12px] font-medium text-white">Hidden gem · PRO</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div
                                        className="py-8 text-center rounded-xl"
                                        style={{ background: '#0A1628', border: '0.5px solid rgba(255,255,255,0.08)' }}
                                    >
                                        <Lock className="w-5 h-5 text-white/30 mx-auto mb-2" />
                                        <p className="text-[13px] text-white/40 mb-3">
                                            Buat akun untuk lihat hari {currentDayPlan.day}
                                        </p>
                                        <Link
                                            href={signUpUrl}
                                            className="inline-flex items-center text-[12px] font-medium text-white bg-[#0D9488] hover:bg-teal-600 px-4 py-2 rounded-lg transition-colors"
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
                    <div
                        className="rounded-xl p-4 mb-4"
                        style={{ background: '#0D2040', border: '0.5px solid rgba(255,255,255,0.08)' }}
                    >
                        <p className="text-[12px] text-white/40 tracking-[1.5px] uppercase mb-3">ESTIMASI BUDGET</p>
                        <div className="grid grid-cols-2 gap-2">
                            {budgetItems.map(item => (
                                <div
                                    key={item.label}
                                    className="rounded-lg px-3 py-[10px]"
                                    style={{ background: item.isTotal ? '#0D9488' : '#0A1628' }}
                                >
                                    <p className="text-[11px] mb-0.5" style={{ color: item.isTotal ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)' }}>{item.label}</p>
                                    <p className="text-[14px] font-medium text-white">{fmtRupiah(item.value)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── CTA FOOTER ── */}
                <div className="rounded-2xl p-6 text-center" style={{ background: '#0A1628' }}>
                    <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-white text-[15px] font-medium mb-1.5">Rencanakan tripmu sendiri</p>
                    <p className="text-white/60 text-[13px] mb-4">Miru generate itinerary lengkap dalam hitungan detik</p>
                    <Link
                        href={signUpUrl}
                        className="block w-full bg-[#0D9488] hover:bg-teal-600 text-white text-[14px] font-medium py-3 rounded-[10px] transition-colors"
                    >
                        Mulai gratis ↗
                    </Link>
                </div>

            </div>
        </div>
    );
}
