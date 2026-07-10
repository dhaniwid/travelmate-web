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
        <nav className="sticky top-0 z-40 bg-[#0A1628] backdrop-blur-md border-b border-white/8">
            <div className="flex items-center h-12">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex items-center justify-center flex-1 h-full text-[13px] font-medium transition-all relative border-b-2",
                            activeTab === tab.id
                                ? "text-teal-600 border-teal-600"
                                : "text-white/40 border-transparent hover:text-white/70"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </nav>
    );
}
