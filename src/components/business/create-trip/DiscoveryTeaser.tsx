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

const CATEGORY_CONFIG: Record<string, { emoji: string; pill: string }> = {
    food: { emoji: '🍜', pill: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    culture: { emoji: '🎭', pill: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    nature: { emoji: '🌿', pill: 'bg-teal-50 text-teal-800 border-teal-200' },
    attraction: { emoji: '🏛️', pill: 'bg-teal-50 text-teal-800 border-teal-200' },
    accommodation: { emoji: '🏨', pill: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    transport: { emoji: '🚄', pill: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
    default: { emoji: '✦', pill: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
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
        <div className="min-w-[220px] max-w-[220px] h-[156px] rounded-xl bg-zinc-100 border border-zinc-200 animate-pulse flex flex-col justify-between p-4">
            <div className="h-4 w-16 bg-zinc-200 rounded-full" />
            <div className="space-y-2">
                <div className="h-5 w-3/4 bg-zinc-200 rounded" />
                <div className="h-3 w-full bg-zinc-200/70 rounded" />
                <div className="h-3 w-2/3 bg-zinc-200/70 rounded" />
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
            className="min-w-[220px] max-w-[220px] h-[156px] rounded-xl bg-zinc-50 border border-zinc-200 p-4 flex flex-col justify-between transition-all duration-200 hover:border-zinc-950 cursor-default select-none"
        >
            {/* Category pill */}
            <div className={cn('self-start flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider', config.pill)}>
                <span>{config.emoji}</span>
                <span>{insight.category}</span>
            </div>

            {/* Place name + snippet */}
            <div className="space-y-1">
                <p className="text-zinc-950 font-bold text-sm leading-tight tracking-tight line-clamp-2">
                    {insight.name}
                </p>
                <p className="text-zinc-500 text-[11px] font-medium leading-relaxed line-clamp-2">
                    {snippet}
                </p>
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
