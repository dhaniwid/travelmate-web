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
    { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/20' },
    { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/20' },
    { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/20' },
    { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/20' },
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

    return (
        <div className="border-b border-white/8">
            {/* Collapsed trigger row */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-3 text-left transition-colors hover:bg-white/5 active:bg-white/8"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                    <span className="text-[13px] text-white/70 font-medium">
                        {isExpanded ? 'Tutup ringkasan' : 'Lihat ringkasan trip'}
                    </span>
                </div>
                {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-white/40 flex-shrink-0" />
                }
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Must Visit Spots */}
                    {mustVisit.length > 0 && (
                        <div>
                            <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2.5">Harus Dikunjungi</p>
                            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none -mx-5 px-5 snap-x snap-mandatory">
                                {mustVisit.map((spot, i) => {
                                    const color = SPOT_COLORS[i % SPOT_COLORS.length];
                                    const Icon = spotIcon(spot.type);
                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'flex-shrink-0 snap-start w-[88px] rounded-2xl border p-2.5 flex flex-col items-center gap-2 text-center',
                                                'bg-[#0A1628]',
                                                color.border
                                            )}
                                        >
                                            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', color.bg)}>
                                                <Icon className={cn('w-4.5 h-4.5', color.text)} style={{ width: 18, height: 18 }} />
                                            </div>
                                            <p className="text-[11px] text-white font-medium leading-tight line-clamp-2">
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
                        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2.5">Hidden Gems</p>
                        <div className="relative rounded-2xl overflow-hidden border border-white/8">
                            {/* Blurred content underneath */}
                            <div className={cn('p-3 bg-[#0A1628] space-y-2', !isPro && 'blur-sm pointer-events-none select-none')}>
                                {hiddenGem ? (
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
                                            <MapPin className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                            <span className="text-[13px] text-white font-medium">{hiddenGem.name || 'Hidden Gem #1'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl">
                                            <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                                            <span className="text-[13px] text-white font-medium">{hiddenGem.why_special ? hiddenGem.why_special.slice(0, 30) + '…' : 'Local secret spot'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <div className="h-9 bg-white/8 rounded-xl" />
                                        <div className="h-9 bg-white/8 rounded-xl" />
                                    </div>
                                )}
                            </div>

                            {/* PRO overlay */}
                            {!isPro && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <button
                                        onClick={onUpgrade}
                                        className="flex items-center gap-1.5 bg-teal-500 hover:bg-teal-400 active:scale-95 transition-all px-4 py-2 rounded-full shadow-lg"
                                    >
                                        <Lock className="w-3 h-3 text-white" />
                                        <span className="text-[12px] text-white font-semibold">2 hidden gems · PRO</span>
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
