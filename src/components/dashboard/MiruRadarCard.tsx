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
            <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-5 relative overflow-hidden">
                <div className="relative z-10 flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center shadow-sm">
                            <Radio className="w-5 h-5 text-teal-600" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Miru Radar</p>
                        <h3 className="text-zinc-950 font-bold text-base leading-tight mb-1">Temukan sekitarmu</h3>
                        <p className="text-zinc-600 text-xs mb-3.5">Aktifkan lokasi untuk melihat tempat menarik di sekitarmu.</p>
                        <Button
                            onClick={requestLocation}
                            size="sm"
                            className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold px-4 h-9"
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
            <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-5 relative overflow-hidden">
                <div className="relative z-10 flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <span className="absolute inset-0 rounded-xl bg-teal-500/20 animate-ping" />
                        <div className="relative w-11 h-11 rounded-xl bg-white border border-zinc-200 flex items-center justify-center">
                            <Radio className="w-5 h-5 text-teal-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Miru Radar</p>
                        <p className="text-zinc-950 font-bold text-sm">Memindai area sekitar...</p>
                        <p className="text-zinc-500 text-xs mt-0.5">Harap tunggu sebentar</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── ERROR ────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-5 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Miru Radar</p>
                        <p className="text-zinc-700 text-sm font-medium">{error}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 rounded-full">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // ── NO DATA ──────────────────────────────────────────────────────────────
    if (!data || !nearest) {
        return (
            <div className="rounded-2xl bg-zinc-100 border border-zinc-200 p-5">
                <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest mb-1">Miru Radar</p>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-600 text-sm">Belum ada landmark di area ini.</p>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200 rounded-full">
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
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 shadow-sm relative overflow-hidden">
            <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <span className="absolute inset-0 rounded-full bg-teal-500/30 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="relative w-8 h-8 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-teal-600" />
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-teal-700 uppercase tracking-widest leading-none">Miru Radar</p>
                            {locationLabel && (
                                <p className="text-zinc-700 text-xs font-medium mt-0.5 flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-teal-600" />
                                    {locationLabel}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={refresh} className="text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 rounded-full w-8 h-8">
                        <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                </div>

                {/* Nearest POI */}
                <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0">
                            <p className="text-zinc-950 font-bold text-base leading-tight truncate">{nearest.name}</p>
                            <p className="text-teal-700 text-xs font-semibold mt-0.5 capitalize">{nearest.category} · {distanceLabel}</p>
                        </div>
                        {nearest.has_stamp && (
                            <span className="flex-shrink-0 text-[10px] font-bold bg-zinc-950 text-white rounded-full px-2.5 py-0.5">
                                🏛️ Stamp
                            </span>
                        )}
                    </div>
                    {nearest.description && (
                        <p className="text-zinc-600 text-xs line-clamp-2 leading-relaxed">{nearest.description}</p>
                    )}
                </div>

                {/* More nearby count */}
                {data.nearby.length > 1 && (
                    <p className="text-zinc-500 text-xs font-medium text-center">
                        +{data.nearby.length - 1} tempat lainnya dalam {geoState === 'denied' ? 'area' : '1 km'}
                    </p>
                )}

                {/* CTAs */}
                <div className="flex gap-2 pt-1">
                    <Button
                        onClick={() => onCreateTrip(data.location.city || nearest.name)}
                        size="sm"
                        className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold h-10"
                    >
                        Buat itinerary dari sini
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                    {nearest.has_stamp && onClaimStamp && (
                        <Button
                            onClick={() => onClaimStamp(nearest.slug || nearest.landmark_slug || nearest.name, data.location.city)}
                            size="sm"
                            variant="outline"
                            className="flex-shrink-0 border-zinc-300 text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-bold h-10 px-3.5"
                        >
                            <Stamp className="w-3.5 h-3.5 mr-1 text-teal-600" />
                            Claim {data.location.city}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
