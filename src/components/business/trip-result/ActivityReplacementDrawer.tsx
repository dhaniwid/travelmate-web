'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ActivityAlternative } from "@/types";
import { MapPin, Star, Plus, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getActivityAlternatives } from "@/actions/ai-swap";

interface ActivityReplacementDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    tripId: string;
    day: number;
    activityIndex: number;
    originalActivity: Activity | null;
    onSelect: (alternative: ActivityAlternative) => void;
}

export default function ActivityReplacementDrawer({
    isOpen,
    onClose,
    tripId,
    day,
    activityIndex,
    originalActivity,
    onSelect
}: ActivityReplacementDrawerProps) {
    const [alternatives, setAlternatives] = useState<ActivityAlternative[]>([]);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Load alternatives (from cache or AI)
    const fetchAlternatives = (force: boolean = false) => {
        if (!tripId || !originalActivity) return;

        startTransition(async () => {
            setError(null);
            try {
                const data = await getActivityAlternatives(tripId, day, activityIndex, force);
                setAlternatives(data);
            } catch (err) {
                setError("Failed to load alternatives.");
            }
        });
    };

    useEffect(() => {
        if (isOpen && originalActivity) {
            // If we already have alternatives in the activity object, use them immediately
            if (originalActivity.alternatives && originalActivity.alternatives.length > 0) {
                setAlternatives(originalActivity.alternatives);
            } else {
                fetchAlternatives(false);
            }
        } else if (!isOpen) {
            setAlternatives([]);
        }
    }, [isOpen, originalActivity, tripId, day, activityIndex]);

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="right" className="sm:max-w-xl p-0 border-l border-slate-100 shadow-2xl">
                <div className="h-full flex flex-col">
                    <div className="p-8 bg-slate-900 text-white">
                        <SheetHeader className="text-left">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-2 py-0.5 bg-blue-500 text-[10px] font-bold uppercase tracking-wider rounded">Replace Mode</span>
                            </div>
                            <SheetTitle className="text-2xl font-black tracking-tight text-white">Better Options Await</SheetTitle>
                            <SheetDescription className="text-slate-400">
                                Switch up your plans with these hand-picked alternatives.
                            </SheetDescription>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                        {/* 1. ORIGINAL ACTIVITY (Grayed Out) */}
                        {originalActivity && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">Current Plan</h4>
                                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 opacity-40 grayscale pointer-events-none blur-[0.5px]">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="text-[10px] uppercase py-0">{originalActivity.time}</Badge>
                                    </div>
                                    <h5 className="font-bold text-slate-800 text-lg">{originalActivity.activity}</h5>
                                    <p className="text-sm text-slate-500 italic mt-1 pb-2 font-medium">"{originalActivity.description}"</p>
                                </div>
                            </div>
                        )}

                        {/* 2. ALTERNATIVES LIST */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-teal-600 font-mono flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 fill-teal-600" />
                                    AI Suggested Alternatives
                                </h4>

                                {!isPending && alternatives.length > 0 && (
                                    <button
                                        onClick={() => fetchAlternatives(true)}
                                        className="text-[10px] font-bold uppercase text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-1"
                                    >
                                        <Loader2 className={cn("w-3 h-3", isPending && "animate-spin")} />
                                        Force Refresh
                                    </button>
                                )}
                            </div>

                            {isPending ? (
                                // SKELETON LOADER
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 relative overflow-hidden">
                                        <div className="animate-pulse flex flex-col gap-4">
                                            <div className="h-4 w-24 bg-slate-200 rounded" />
                                            <div className="h-8 w-4/5 bg-slate-200 rounded" />
                                            <div className="h-16 w-full bg-slate-200 rounded" />
                                            <div className="h-12 w-full bg-slate-200 rounded-2xl" />
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                                    </div>
                                ))
                            ) : error ? (
                                <div className="text-center p-8 bg-red-50 rounded-3xl border border-red-100">
                                    <p className="text-red-600 font-bold mb-2">Oops!</p>
                                    <p className="text-red-400 text-sm">{error}</p>
                                    <Button variant="outline" onClick={() => fetchAlternatives(true)} className="mt-4 rounded-full border-red-200 text-red-600 font-bold">Try Refreshing</Button>
                                </div>
                            ) : (
                                <>
                                    {alternatives.map((alt, idx) => (
                                        <div
                                            key={idx}
                                            className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-teal-200 hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <Badge className="bg-teal-50 text-teal-700 text-[10px] font-black uppercase rounded-lg border-teal-100/50">
                                                        Alternative {idx + 1}
                                                    </Badge>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                        <MapPin className="w-3 h-3" />
                                                        {alt.place_name}
                                                    </div>
                                                </div>

                                                <h5 className="font-black text-slate-900 text-xl leading-tight group-hover:text-teal-600 transition-colors">
                                                    {alt.activity}
                                                </h5>

                                                <p className="text-sm text-slate-600 leading-relaxed font-medium italic border-l-2 border-teal-50 pl-4">
                                                    "{alt.description}"
                                                </p>

                                                <Button
                                                    onClick={() => onSelect(alt)}
                                                    className="w-full mt-2 rounded-2xl bg-[#42707D] hover:bg-[#355963] text-white font-bold h-12 shadow-lg shadow-teal-900/10 transition-all active:scale-95"
                                                >
                                                    Select This Plan
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-4 text-center">
                                        <button
                                            onClick={() => fetchAlternatives(true)}
                                            className="text-sm font-bold text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2 justify-center mx-auto"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            I don't like these, show more
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full rounded-2xl font-bold text-slate-500 h-12"
                        >
                            Nevermind, keep the original
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
