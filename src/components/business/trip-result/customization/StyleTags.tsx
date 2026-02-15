'use client';

import React from 'react';
import { Check, Mountain, Landmark, Utensils, Heart, Swords, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StyleTagsProps {
    selected: string[];
    onToggle: (tag: string) => void;
}

const STYLE_OPTIONS = [
    { label: 'Outdoor', icon: Mountain },
    { label: 'Cultural', icon: Landmark },
    { label: 'Foodie', icon: Utensils },
    { label: 'Relaxation', icon: Heart },
    { label: 'Adventure', icon: Swords },
    { label: 'Shopping', icon: ShoppingBag },
];

export default function StyleTags({ selected, onToggle }: StyleTagsProps) {
    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800">Activity Style</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-4">
                {STYLE_OPTIONS.map((style) => {
                    const isSelected = selected.includes(style.label);
                    const Icon = style.icon;
                    return (
                        <button
                            key={style.label}
                            onClick={() => onToggle(style.label)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[0.95rem] font-bold transition-all border shadow-sm active:scale-95 group",
                                isSelected
                                    ? "bg-teal-600 text-white border-teal-600 shadow-teal-100 shadow-lg"
                                    : "bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Icon className={cn("w-4 h-4", isSelected ? "text-white" : "text-slate-500")} />
                            <span>{style.label}</span>
                            <div className={cn(
                                "flex items-center justify-center w-5 h-5 rounded-full transition-colors",
                                isSelected ? "bg-white/20" : "bg-slate-200 group-hover:bg-slate-300"
                            )}>
                                {isSelected ? (
                                    <Check className="w-3 h-3 text-white" />
                                ) : (
                                    <span className="text-sm leading-none mb-0.5 text-slate-500">+</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
