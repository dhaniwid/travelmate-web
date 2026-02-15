'use client';

import React from 'react';
import { MousePointer2, Wine, Zap, Utensils, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaceVibeGridProps {
    selectedPace: string;
    selectedVibe: string[];
    onPaceChange: (pace: string) => void;
    onVibeToggle: (vibe: string) => void;
}

const PACE_OPTIONS = [
    { id: 'FAST', label: 'Fast', icon: Zap, description: 'See it all' },
    { id: 'RELAXED', label: 'Relaxed', icon: Wine, description: 'Take it slow' },
];

const VIBE_OPTIONS = [
    { id: 'BALANCED', label: 'Balanced', icon: MousePointer2, description: 'Best of both' },
    { id: 'FOODIE', label: 'Foodie', icon: Utensils, description: 'Culinary focus' },
];

export default function PaceVibeGrid({ selectedPace, selectedVibe, onPaceChange, onVibeToggle }: PaceVibeGridProps) {
    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800 px-1">Pace & Vibe</h4>
            <div className="grid grid-cols-2 gap-4">
                {[...PACE_OPTIONS, ...VIBE_OPTIONS].map((opt) => {
                    const isPace = PACE_OPTIONS.some(p => p.id === opt.id);
                    const isSelected = isPace ? selectedPace === opt.id : selectedVibe.includes(opt.id);
                    const Icon = opt.icon;

                    return (
                        <button
                            key={opt.id}
                            onClick={() => isPace ? onPaceChange(opt.id) : onVibeToggle(opt.id)}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-6 rounded-[2rem] bg-white border transition-all duration-300 group",
                                isSelected
                                    ? "border-teal-500 border-2 shadow-xl shadow-teal-900/5 ring-1 ring-teal-500/20"
                                    : "border-slate-100 hover:border-slate-200 shadow-sm"
                            )}
                        >
                            {isSelected && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center animate-in zoom-in duration-300">
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                                </div>
                            )}

                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                                isSelected ? "bg-teal-50 text-teal-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                            )}>
                                <Icon className="w-7 h-7" />
                            </div>

                            <span className={cn(
                                "text-lg font-bold transition-colors",
                                isSelected ? "text-slate-900" : "text-slate-500"
                            )}>
                                {opt.label}
                            </span>
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">
                                {opt.description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
