'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, BarChart3, Backpack, Map, Stamp } from 'lucide-react';

export type TabType = 'overview' | 'itinerary' | 'essentials';

interface StickyTabNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar className="w-4 h-4" /> },
    { id: 'essentials', label: 'Essentials', icon: <Backpack className="w-4 h-4" /> },
];

export default function StickyTabNav({ activeTab, onTabChange }: StickyTabNavProps) {
    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-1 md:gap-8 h-14 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 md:px-4 h-full font-bold text-sm transition-all relative border-b-2",
                                activeTab === tab.id
                                    ? "text-teal-600 border-teal-600 bg-teal-50/50"
                                    : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-200 hover:bg-slate-50/50"
                            )}
                        >
                            {tab.icon}
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
