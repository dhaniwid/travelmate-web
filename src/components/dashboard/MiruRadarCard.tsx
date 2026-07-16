'use client';

import { useRadar } from '@/hooks/useRadar';
import { Loader2, MapPin, Navigation, Stamp, ArrowRight, RefreshCw, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MiruRadarCardProps {
    onCreateTrip: (destination: string) => void;
    onClaimStamp?: (citySlug: string, city: string) => void;
}

export default function MiruRadarCard({ onCreateTrip, onClaimStamp }: MiruRadarCardProps) {
    const { data, loading, error, geoState, requestLocation, refresh } = useRadar();

    const nearest = data?.nearby?.[0];

    // ── IDLE: not yet requested ──────────────────────────────────────────────
    if (geoState === 'idle') {
        return (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-teal-400" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Miru Radar</p>
                        <h3 className="text-white font-bold text-lg leading-tight mb-1">Temukan sekitarmu</h3>
                        <p className="text-slate-400 text-sm mb-4">Aktifkan lokasi untuk melihat tempat menarik di sekitarmu.</p>
                        <Button
                            onClick={requestLocation}
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold px-4"
                        >
                            <Navigation className="w-3.5 h-3.5 mr-1.5" />
                            Aktifkan Radar
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── REQUESTING / LOADING ─────────────────────────────────────────────────
    if (geoState === 'requesting' || loading) {
        return (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 p-6 shadow-xl relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center gap-4">
                    {/* Pulse animation */}
                    <div className="relative flex-shrink-0">
                        <span className="absolute inset-0 rounded-full bg-teal-500/30 animate-ping" />
                        <div className="relative w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-teal-400" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Miru Radar</p>
                        <p className="text-white font-semibold text-sm">Memindai area sekitar...</p>
                        <p className="text-slate-400 text-xs mt-0.5">Harap tunggu sebentar</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── ERROR ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Miru Radar</p>
                        <p className="text-slate-300 text-sm">{error}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/50 rounded-full">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ── NO DATA ──────────────────────────────────────────────────────────────
    if (!data || !nearest) {
        return (
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 p-6 shadow-xl">
                <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest mb-1">Miru Radar</p>
                <div className="flex items-center justify-between">
                    <p className="text-slate-400 text-sm">Belum ada landmark di area ini.</p>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-teal-400 hover:text-teal-300 hover:bg-teal-900/50 rounded-full">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ── RADAR RESULT ─────────────────────────────────────────────────────────
    const locationLabel = [data.location.area, data.location.city].filter(Boolean).join(', ');
    const distanceLabel = nearest.distance_meters < 1000
        ? `${Math.round(nearest.distance_meters)} m`
        : `${(nearest.distance_meters / 1000).toFixed(1)} km`;

    return (
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 border border-teal-800/40 p-6 shadow-xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <span className="absolute inset-0 rounded-full bg-teal-500/40 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="relative w-7 h-7 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
                                <Radio className="w-3.5 h-3.5 text-teal-400" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-widest leading-none">Miru Radar</p>
                            {locationLabel && (
                                <p className="text-slate-300 text-xs mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-teal-500" />
                                    {locationLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-slate-500 hover:text-teal-400 hover:bg-teal-900/50 rounded-full w-8 h-8">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Nearest POI */}
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                            <p className="text-white font-bold text-base leading-tight truncate">{nearest.name}</p>
                            <p className="text-teal-400 text-xs font-semibold mt-0.5 capitalize">{nearest.category} · {distanceLabel}</p>
                        </div>
                        {nearest.has_stamp && (
                            <span className="flex-shrink-0 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full px-2 py-0.5">
                                🏛️ Stamp
                            </span>
                        )}
                    </div>
                    {nearest.description && (
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{nearest.description}</p>
                    )}
                </div>

                {/* More nearby count */}
                {data.nearby.length > 1 && (
                    <p className="text-slate-500 text-xs text-center">
                        +{data.nearby.length - 1} tempat lainnya dalam {geoState === 'denied' ? 'area' : '1 km'}
                    </p>
                )}

                {/* CTAs */}
                <div className="flex gap-2 pt-1">
                    <Button
                        onClick={() => onCreateTrip(data.location.city || nearest.name)}
                        size="sm"
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full text-xs font-bold h-9"
                    >
                        Buat itinerary dari sini
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    {nearest.has_stamp && onClaimStamp && (
                        <Button
                            onClick={() => onClaimStamp(nearest.slug || nearest.landmark_slug || nearest.name, data.location.city)}
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 rounded-full text-xs font-bold h-9 px-3"
                        >
                            <Stamp className="w-3.5 h-3.5 mr-1" />
                            Claim {data.location.city}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
