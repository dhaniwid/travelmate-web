'use client';

import React from 'react';
import { Mountain, Building2, Palmtree } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetTierCardsProps {
    selected: 'low' | 'med' | 'high';
    onChange: (tier: 'low' | 'med' | 'high') => void;
}

const TIERS = [
    {
        id: 'low',
        label: 'Budget-friendly',
        price: '$',
        icon: Mountain,
        desc: 'Affordable stays & local eats.'
    },
    {
        id: 'med',
        label: 'Moderate',
        price: '$$',
        icon: Building2,
        desc: 'Comfortable hotels & diverse dining.'
    },
    {
        id: 'high',
        label: 'Luxury',
        price: '$$$',
        icon: Palmtree,
        desc: 'Premium experiences & exclusive service.'
    },
];

export default function BudgetTierCards({ selected, onChange }: BudgetTierCardsProps) {
    return (
        <div className="space-y-6">
            <h4 className="text-xl font-bold text-slate-800">Budget Tier</h4>
            <div className="grid grid-cols-3 gap-5">
                {TIERS.map((tier) => {
                    const isSelected = selected === tier.id;
                    const Icon = tier.icon;
                    return (
                        <button
                            key={tier.id}
                            onClick={() => onChange(tier.id as any)}
                            className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-[1.5rem] border text-center transition-all duration-300 active:scale-95 h-full",
                                isSelected
                                    ? "bg-[#F0F7FA] border-[#42707D] shadow-xl ring-1 ring-[#42707D]/20"
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                            )}
                        >
                            <div className="text-slate-400 font-bold text-lg mb-[-4px]">
                                {tier.price}
                            </div>
                            <div className="text-sm font-black text-slate-900 leading-tight mb-1">
                                {tier.label}
                            </div>

                            <div className={cn(
                                "w-16 h-12 flex items-center justify-center transition-all duration-500",
                                isSelected ? "text-[#42707D]" : "text-slate-300"
                            )}>
                                <Icon className="w-8 h-8" />
                            </div>

                            <p className="text-[0.75rem] text-slate-500 leading-[1.3] mt-1 font-medium">
                                {tier.desc}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
