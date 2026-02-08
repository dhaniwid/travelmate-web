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
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[1rem] font-bold transition-all border shadow-sm active:scale-95",
                                isSelected
                                    ? "bg-[#546E7A] text-white border-[#546E7A] shadow-md ring-1 ring-[#546E7A]/20"
                                    : "bg-[#F3F5F7] text-[#455A64] border-slate-200 hover:border-slate-300"
                            )}
                        >
                            <Icon className="w-5 h-5 opacity-70" />
                            {style.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
