'use client';

import React from 'react';
import { Leaf, WheatOff, Moon, Check, Carrot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DietaryTagsProps {
    selected: string[];
    onToggle: (tag: string) => void;
}

const DIETARY_OPTIONS = [
    { id: 'Vegan', label: 'Vegan', icon: Leaf },
    { id: 'Vegetarian', label: 'Vegetarian', icon: Carrot },
    { id: 'Gluten-Free', label: 'Gluten-Free', icon: WheatOff },
    { id: 'Halal', label: 'Halal', icon: Moon },
];

export default function DietaryTags({ selected, onToggle }: DietaryTagsProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-xl font-bold text-slate-800 px-1">Dietary Preferences</h4>
            <div className="flex overflow-x-auto space-x-3 pb-4 px-1 scrollbar-hide snap-x">
                {DIETARY_OPTIONS.map((opt) => {
                    const isSelected = selected.includes(opt.id);
                    const Icon = opt.icon;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => onToggle(opt.id)}
                            className={cn(
                                "flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold transition-all border whitespace-nowrap snap-center active:scale-95 group",
                                isSelected
                                    ? "bg-teal-600 text-white border-teal-600 shadow-lg shadow-teal-900/20"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 ml-0.5 animate-in fade-in zoom-in duration-300" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
