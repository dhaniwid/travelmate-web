'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type TabType = 'itinerary' | 'map' | 'logistics';

interface StickyTabNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string }[] = [
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'map', label: 'Map' },
    { id: 'logistics', label: 'Logistics' },
];

export default function StickyTabNav({ activeTab, onTabChange }: StickyTabNavProps) {
    return (
        <nav className="sticky top-0 z-40 bg-white border-b border-zinc-200 max-w-[480px] md:max-w-2xl lg:max-w-3xl mx-auto">
            <div className="flex items-center h-12">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center justify-center flex-1 h-full text-[13px] font-bold transition-all relative border-b-2",
                            activeTab === tab.id
                                ? "text-zinc-950 border-zinc-950"
                                : "text-zinc-400 border-transparent hover:text-zinc-700"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
