'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DietaryTagsProps {
    selected: string[];
    onToggle: (tag: string) => void;
}

const DIETARY_OPTIONS = [
    'Vegan',
    'Halal',
    'No Seafood',
    'Vegetarian',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free'
];

export default function DietaryTags({ selected, onToggle }: DietaryTagsProps) {
    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800">Dietary Preferences</h4>
            <div className="flex flex-wrap gap-x-3 gap-y-4">
                {DIETARY_OPTIONS.map((tag) => {
                    const isSelected = selected.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onToggle(tag)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[1rem] font-bold transition-all border shadow-sm active:scale-95",
                                isSelected
                                    ? "bg-[#546E7A] text-white border-[#546E7A] shadow-md ring-1 ring-[#546E7A]/20"
                                    : "bg-[#F3F5F7] text-[#455A64] border-slate-200 hover:border-slate-300"
                            )}
                        >
                            {/* Dummy icon for dietary as per mockup */}
                            <span className="opacity-70">
                                {tag === 'Vegan' ? '🌱' : tag === 'Halal' ? '🌙' : tag === 'No Seafood' ? '🐠' : '🍽️'}
                            </span>
                            {tag}
                            <span className="ml-1 opacity-40">
                                {isSelected ? '✓' : '+'}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
