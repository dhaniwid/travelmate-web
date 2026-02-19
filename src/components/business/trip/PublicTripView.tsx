'use client';

import React from 'react';
import { TripResponse } from '@/types';
import {
    MapPin,
    Calendar,
    Clock,
    Sparkles,
    ExternalLink,
    Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface PublicTripViewProps {
    data: TripResponse;
}

export default function PublicTripView({ data }: PublicTripViewProps) {
    const { trip, plan } = data;

    // Derive date range
    const startDateObj = trip.start_date ? new Date(trip.start_date) : null;
    let dateRange = '';
    if (startDateObj && !isNaN(startDateObj.getTime())) {
        const formattedStart = formatDate(startDateObj);
        let formattedEnd = '';
        if (trip.trip_days > 0) {
            const endDateObj = new Date(startDateObj);
            endDateObj.setDate(startDateObj.getDate() + (trip.trip_days - 1));
            formattedEnd = formatDate(endDateObj);
        }
        dateRange = formattedEnd ? `${formattedStart} – ${formattedEnd}` : formattedStart;
    }

    const handleCopyLink = () => {
        if (typeof window === 'undefined') return;
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
    };

    const heroImage = (plan as any)?.image_url || (trip as any)?.image_url || null;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* ── HERO HEADER ── */}
            <div className="relative w-full h-[55vw] max-h-[520px] min-h-[280px] overflow-hidden bg-slate-900">
                {heroImage && (
                    <img
                        src={heroImage}
                        alt={trip.destination}
                        className="absolute inset-0 w-full h-full object-cover scale-105"
                    />
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />

                {/* Top bar */}
                <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 py-4 z-10">
                    {/* Miru wordmark */}
                    <a href="/" className="text-white font-black text-xl tracking-tight drop-shadow-md">
                        miru<span className="text-teal-400">.</span>
                    </a>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="text-white bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 gap-2 text-xs font-bold"
                    >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </Button>
                </div>

                {/* Destination info */}
                <div className="absolute inset-x-0 bottom-0 px-6 pb-8 z-10 space-y-2">
                    <Badge className="bg-teal-500/80 text-white border-none text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                        <Sparkles className="w-3 h-3 mr-1" /> AI-Generated Itinerary
                    </Badge>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">
                        {trip.destination || 'Amazing Destination'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm font-medium">
                        {dateRange && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 opacity-70" />
                                {dateRange}
                            </span>
                        )}
                        {trip.trip_days > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4 opacity-70" />
                                {trip.trip_days} {trip.trip_days === 1 ? 'Day' : 'Days'}
                            </span>
                        )}
                        {trip.origin && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 opacity-70" />
                                From {trip.origin}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── ITINERARY ── */}
            <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">
                <div className="text-center space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Day-by-Day Plan</p>
                    <h2 className="text-2xl font-black text-slate-900">Your Itinerary</h2>
                </div>

                {plan?.itinerary && plan.itinerary.length > 0 ? (
                    plan.itinerary.map((dayPlan) => (
                        <div key={dayPlan.day} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Day header */}
                            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-3 flex items-center gap-3">
                                <span className="bg-white/20 text-white font-black text-sm px-3 py-1 rounded-full">
                                    Day {dayPlan.day}
                                </span>
                                {dayPlan.title && (
                                    <span className="text-white/90 text-sm font-medium truncate">{dayPlan.title}</span>
                                )}
                            </div>

                            {/* Activities */}
                            <ul className="divide-y divide-slate-50">
                                {(dayPlan.activities || []).map((act, i) => (
                                    <li key={i} className="px-5 py-3.5 flex gap-4">
                                        {/* Time pill */}
                                        <div className="shrink-0 pt-0.5">
                                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                                                {act.time || '—'}
                                            </span>
                                        </div>
                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 leading-snug">{act.activity}</p>
                                            {act.place_name && (
                                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {act.place_name}
                                                </p>
                                            )}
                                            {act.description && (
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                                    {act.description}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-slate-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium">Itinerary details coming soon</p>
                    </div>
                )}

                {/* ── CTA FOOTER ── */}
                <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-8 text-center space-y-4 shadow-xl">
                    <Sparkles className="w-8 h-8 mx-auto text-white/70" />
                    <h3 className="text-xl font-black text-white leading-snug">
                        Plan your dream trip with Miru
                    </h3>
                    <p className="text-teal-100 text-sm max-w-xs mx-auto">
                        AI-generated itineraries tailored to your budget, pace, and interests — in seconds.
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 bg-white text-teal-700 font-black text-sm px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
                    >
                        Start Planning Free
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}
