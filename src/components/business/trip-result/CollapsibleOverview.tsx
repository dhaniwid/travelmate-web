'use client';

import React from 'react';
import { ChevronRight, ChevronDown, MapPin, Lock, Sparkles, Building2, Utensils, TreePine, Waves, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Trip, TripPlan, TripHighlight } from '@/types';
import Link from 'next/link';

interface CollapsibleOverviewProps {
    trip: Trip;
    plan: TripPlan;
    isExpanded: boolean;
    onToggle: () => void;
    isPro: boolean;
    onUpgrade: () => void;
}

const TYPE_ICON: Record<string, React.ElementType> = {
    landmark: Landmark,
    food: Utensils,
    nature: TreePine,
    beach: Waves,
    culture: Building2,
};

function spotIcon(type: string) {
    const key = type?.toLowerCase() ?? '';
    const Icon = Object.entries(TYPE_ICON).find(([k]) => key.includes(k))?.[1] ?? MapPin;
    return Icon;
}

const SPOT_COLORS = [
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-zinc-200' },
    { bg: 'bg-zinc-100', text: 'text-zinc-900', border: 'border-zinc-200' },
    { bg: 'bg-zinc-100', text: 'text-zinc-900', border: 'border-zinc-200' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-zinc-200' },
    { bg: 'bg-zinc-100', text: 'text-zinc-900', border: 'border-zinc-200' },
];

export default function CollapsibleOverview({
    trip,
    plan,
    isExpanded,
    onToggle,
    isPro,
    onUpgrade,
}: CollapsibleOverviewProps) {
    const mustVisit: TripHighlight[] = React.useMemo(() => {
        if (plan.highlights && plan.highlights.length > 0) return plan.highlights.slice(0, 5);
        return (plan.itinerary || [])
            .slice(0, 5)
            .map(day => (day.activities || [])[0])
            .filter(Boolean)
            .map(act => ({
                title: act.place_name || act.activity,
                type: act.type || 'landmark',
                hook: act.description,
                image_prompt: '',
            }));
    }, [plan.highlights, plan.itinerary]);

    const hiddenGem = (plan as any).hidden_gem ?? null;
    const totalActivities = React.useMemo(() => {
        return (plan.itinerary || []).reduce((acc, day) => acc + (day.activities?.length || 0), 0);
    }, [plan.itinerary]);

    const bd = plan.budget_breakdown;
    const estimatedTotal = bd
        ? (bd.transport || 0) + (bd.accommodation || 0) + (bd.food || 0) + (bd.tickets || 0) + (bd.misc || 0)
        : 0;

    return (
        <div className="border-b border-zinc-200 bg-zinc-50/70 max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto">
            {/* Collapsed trigger row with inline key metrics */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-4 md:px-5 py-3 text-left transition-colors hover:bg-zinc-100/80 active:bg-zinc-100 gap-2"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="text-[12px] text-zinc-900 font-bold">
                        {totalActivities} Aktivitas
                    </span>
                    {estimatedTotal > 0 && (
                        <>
                            <span className="text-zinc-300">·</span>
                            <span className="text-[12px] font-semibold text-teal-700">
                                Est. Rp {(estimatedTotal / 1000).toLocaleString('id-ID')}rb
                            </span>
                        </>
                    )}
                    <span className="text-zinc-300">·</span>
                    <span className="text-[12px] text-zinc-500 font-medium">
                        {isExpanded ? 'Tutup highlight' : 'Lihat highlight & hidden gems'}
                    </span>
                </div>
                {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                }
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Must Visit Spots */}
                    {mustVisit.length > 0 && (
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">Harus Dikunjungi</p>
                            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5 snap-x snap-mandatory">
                                {mustVisit.map((spot, i) => {
                                    const color = SPOT_COLORS[i % SPOT_COLORS.length];
                                    const Icon = spotIcon(spot.type);
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'flex-shrink-0 snap-start w-[96px] rounded-xl border p-2.5 flex flex-col items-center gap-2 text-center bg-white',
                                                color.border
                                            )}
                                        >
                                            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', color.bg)}>
                                                <Icon className={cn('w-4 h-4', color.text)} />
                                            </div>
                                            <p className="text-[11px] text-zinc-900 font-semibold leading-tight line-clamp-2">
                                                {spot.title}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Hidden Gems — PRO blur */}
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2.5">Hidden Gems</p>
                        <div className="relative rounded-xl overflow-hidden border border-zinc-200 bg-white">
                            {/* Blurred content underneath */}
                            <div className={cn('p-3 space-y-2', !isPro && 'blur-sm pointer-events-none select-none')}>
                                {hiddenGem ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                            <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                            <span className="text-[13px] text-zinc-900 font-semibold">{hiddenGem.name || 'Hidden Gem #1'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-100">
                                            <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                                            <span className="text-[13px] text-zinc-700 font-medium">{hiddenGem.why_special ? hiddenGem.why_special.slice(0, 30) + '…' : 'Local secret spot'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="h-9 bg-zinc-100 rounded-lg" />
                                        <div className="h-9 bg-zinc-100 rounded-lg" />
                                    </div>
                                )}
                            </div>

                            {/* PRO overlay */}
                            {!isPro && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                                    <button
                                        onClick={onUpgrade}
                                        className="flex items-center gap-1.5 bg-zinc-950 hover:bg-zinc-800 active:scale-95 transition-all px-4 py-2 rounded-full shadow-md"
                                    >
                                        <Lock className="w-3 h-3 text-teal-400" />
                                        <span className="text-[12px] text-white font-bold">2 hidden gems · PRO</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
