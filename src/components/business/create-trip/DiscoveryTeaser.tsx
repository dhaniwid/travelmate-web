'use client';

import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Insight {
    name: string;
    category: string;
    description: string;
    city: string;
}

interface DiscoveryTeaserProps {
    destination: string;
}

// ─── Category → visual config ─────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { emoji: string; gradient: string; ring: string; pill: string }> = {
    food: { emoji: '🍜', gradient: 'from-orange-900/60 via-slate-900 to-slate-900', ring: 'ring-orange-500/20', pill: 'bg-orange-500/15 text-orange-300 border-orange-500/20' },
    culture: { emoji: '🎭', gradient: 'from-purple-900/60 via-slate-900 to-slate-900', ring: 'ring-purple-500/20', pill: 'bg-purple-500/15 text-purple-300 border-purple-500/20' },
    nature: { emoji: '🌿', gradient: 'from-emerald-900/60 via-slate-900 to-slate-900', ring: 'ring-emerald-500/20', pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20' },
    attraction: { emoji: '🏛️', gradient: 'from-teal-900/60 via-slate-900 to-slate-900', ring: 'ring-teal-500/20', pill: 'bg-teal-500/15 text-teal-300 border-teal-500/20' },
    accommodation: { emoji: '🏨', gradient: 'from-blue-900/60 via-slate-900 to-slate-900', ring: 'ring-blue-500/20', pill: 'bg-blue-500/15 text-blue-300 border-blue-500/20' },
    transport: { emoji: '🚄', gradient: 'from-cyan-900/60 via-slate-900 to-slate-900', ring: 'ring-cyan-500/20', pill: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/20' },
    default: { emoji: '✦', gradient: 'from-slate-800/80 via-slate-900 to-slate-900', ring: 'ring-slate-500/20', pill: 'bg-slate-500/15 text-slate-300 border-slate-500/20' },
};

function getCategoryConfig(category: string) {
    const key = category?.toLowerCase() ?? '';
    return (
        Object.entries(CATEGORY_CONFIG).find(([k]) => key.includes(k))?.[1] ??
        CATEGORY_CONFIG.default
    );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
    return (
        <div className="min-w-[220px] max-w-[220px] h-[168px] rounded-2xl bg-slate-800/60 ring-1 ring-white/5 animate-pulse flex flex-col justify-between p-4">
            <div className="h-4 w-16 bg-slate-700 rounded-full" />
            <div className="space-y-2">
                <div className="h-5 w-3/4 bg-slate-700 rounded" />
                <div className="h-3 w-full bg-slate-700/60 rounded" />
                <div className="h-3 w-2/3 bg-slate-700/60 rounded" />
            </div>
        </div>
    );
}

// ─── Single insight card ─────────────────────────────────────────────────────

function InsightCard({ insight }: { insight: Insight }) {
    const config = getCategoryConfig(insight.category);
    const snippet = insight.description.length > 90
        ? insight.description.slice(0, 90).trimEnd() + '…'
        : insight.description;

    return (
        <div
            className={cn(
                'min-w-[220px] max-w-[220px] h-[168px] rounded-2xl overflow-hidden',
                'ring-1 shadow-lg shadow-black/40 flex flex-col',
                'transition-transform duration-200 hover:scale-[1.02] cursor-default select-none',
                config.ring
            )}
        >
            {/* Gradient header band */}
            <div className={cn('bg-gradient-to-br h-full flex flex-col justify-between p-4', config.gradient)}>
                {/* Category pill */}
                <div className={cn('self-start flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest', config.pill)}>
                    <span>{config.emoji}</span>
                    <span>{insight.category}</span>
                </div>

                {/* Place name + snippet */}
                <div className="space-y-1.5">
                    <p className="text-white font-black text-base leading-tight tracking-tight line-clamp-2">
                        {insight.name}
                    </p>
                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed line-clamp-2">
                        {snippet}
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function DiscoveryTeaser({ destination }: DiscoveryTeaserProps) {
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Clear previous timer on every destination change
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Hide immediately when destination is too short
        if (!destination || destination.trim().length < 3) {
            setVisible(false);
            setInsights([]);
            return;
        }

        // Debounce 500ms
        debounceRef.current = setTimeout(async () => {
            setIsLoading(true);
            setVisible(true);

            try {
                const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8889/api/v1';
                const res = await fetch(
                    `${apiBase}/destinations/${encodeURIComponent(destination.trim())}/insights`,
                    { cache: 'no-store' }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json() as { insights: Insight[] };
                setInsights(data.insights ?? []);
            } catch {
                // Fail silently — this is a nice-to-have teaser, not critical
                setInsights([]);
            } finally {
                setIsLoading(false);
            }
        }, 500);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [destination]);

    // Don't render the container at all if there's nothing to show
    if (!visible) return null;
    if (!isLoading && insights.length === 0) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            {/* Header label */}
            <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    Local Whispers ✦
                </p>
                <p className="text-[11px] text-slate-500 font-medium capitalize">
                    {destination}
                </p>
            </div>

            {/* Horizontal scroll carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {isLoading
                    ? [1, 2].map((i) => <SkeletonCard key={i} />)
                    : insights.map((insight, i) => (
                        <div key={i} className="snap-start flex-shrink-0">
                            <InsightCard insight={insight} />
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
