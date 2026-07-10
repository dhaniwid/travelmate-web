'use client';

import React, { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DayNavigatorProps {
    days: number[];
    activeDay: number;
    onDayClick: (day: number) => void;
    className?: string;
}

export default function DayNavigator({ days, activeDay, onDayClick, className }: DayNavigatorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll active pill into view
    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;
        const active = container.querySelector(`[data-day="${activeDay}"]`) as HTMLElement;
        if (active) {
            active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [activeDay]);

    return (
        <div className={cn(
            'sticky top-12 z-30 bg-[#060F1E]/95 backdrop-blur-md border-b border-white/8 px-4 py-2.5 overflow-x-auto scrollbar-none',
            className
        )}>
            <div ref={scrollRef} className="flex items-center gap-2 min-w-max snap-x snap-mandatory">
                {days.map((day) => (
                    <button
                        key={day}
                        data-day={day}
                        onClick={() => onDayClick(day)}
                        className={cn(
                            'snap-start flex-shrink-0 h-8 px-4 rounded-full text-[13px] font-medium transition-all duration-200 active:scale-95',
                            activeDay === day
                                ? 'bg-teal-500 text-white shadow-sm shadow-teal-900/40'
                                : 'text-white/50 border border-white/10 hover:text-white/80 hover:border-white/20'
                        )}
                    >
                        Hari {day}
                    </button>
                ))}
            </div>
        </div>
    );
}
