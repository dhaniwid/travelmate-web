'use client';

import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, ActivityAlternative } from "@/types";
import { MapPin, Star, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityReplacementDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    originalActivity: Activity | null;
    alternatives: ActivityAlternative[];
    onSelect: (alternative: ActivityAlternative) => void;
}

export default function ActivityReplacementDrawer({
    isOpen,
    onClose,
    originalActivity,
    alternatives,
    onSelect
}: ActivityReplacementDrawerProps) {
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
                                    <p className="text-sm text-slate-500 italic mt-1 pb-2">"{originalActivity.description}"</p>
                                </div>
                            </div>
                        )}

                        {/* 2. ALTERNATIVES LIST */}
                        <div className="space-y-5">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-teal-600 font-mono flex items-center gap-2">
                                <Star className="w-3 h-3 fill-teal-600" />
                                Premium Alternatives
                            </h4>

                            {alternatives.length > 0 ? alternatives.map((alt, idx) => (
                                <div
                                    key={idx}
                                    className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:border-teal-200 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div className="px-2.5 py-1 bg-teal-50 text-teal-700 text-[10px] font-black uppercase rounded-lg">
                                                Option {idx + 1}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                                <MapPin className="w-3 h-3" />
                                                {alt.place_name}
                                            </div>
                                        </div>

                                        <h5 className="font-black text-slate-900 text-xl leading-tight group-hover:text-teal-600 transition-colors">
                                            {alt.activity}
                                        </h5>

                                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-teal-50 pl-4">
                                            "{alt.description}"
                                        </p>

                                        <Button
                                            onClick={() => onSelect(alt)}
                                            className="w-full mt-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold h-12 shadow-lg shadow-teal-900/10 transition-all active:scale-95"
                                        >
                                            Select This Plan
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                // Fallback mock alternatives if none provided
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 text-center animate-pulse">
                                        <div className="h-4 w-24 bg-slate-200 rounded mx-auto mb-4" />
                                        <div className="h-6 w-48 bg-slate-200 rounded mx-auto" />
                                    </div>
                                ))
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
