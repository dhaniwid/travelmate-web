'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, Backpack, Map, PlaneTakeoff } from 'lucide-react';

export type TabType = 'overview' | 'itinerary' | 'essentials' | 'map' | 'flights';

interface StickyTabNavProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const TABS: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'itinerary', label: 'Itinerary', icon: <Calendar className="w-4 h-4" /> },
    { id: 'map', label: 'Map', icon: <Map className="w-4 h-4" /> },
    { id: 'flights', label: 'Logistics', icon: <PlaneTakeoff className="w-4 h-4" />, badge: 'LIVE' },
    { id: 'essentials', label: 'Essentials', icon: <Backpack className="w-4 h-4" /> },
];

export default function StickyTabNav({ activeTab, onTabChange }: StickyTabNavProps) {
    return (
        <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center gap-1 md:gap-6 h-14 overflow-x-auto no-scrollbar">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-3 md:px-4 h-full font-bold text-sm transition-all relative border-b-2 shrink-0",
                                activeTab === tab.id
                                    ? "text-teal-600 border-teal-600 bg-teal-50/50"
                                    : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-200 hover:bg-slate-50/50"
                            )}
                        >
                            {tab.icon}
                            <span className="whitespace-nowrap">{tab.label}</span>
                            {tab.badge && (
                                <span className="ml-1 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-teal-100 text-teal-700 rounded-full">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    );
}
