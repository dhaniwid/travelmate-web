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
            'sticky top-12 z-30 bg-white border-b border-zinc-200 px-4 py-2.5 overflow-x-auto scrollbar-none',
            className
        )}>
            <div ref={scrollRef} className="flex items-center gap-2 min-w-max snap-x snap-mandatory">
                {days.map((day) => (
                    <button
                        key={day}
                        data-day={day}
                        onClick={() => onDayClick(day)}
                        className={cn(
                            'snap-start flex-shrink-0 h-8 px-4 rounded-full text-[13px] font-bold transition-all duration-200 active:scale-95',
                            activeDay === day
                                ? 'bg-zinc-950 text-white shadow-sm'
                                : 'bg-zinc-100 text-zinc-600 border border-zinc-200 hover:text-zinc-950 hover:border-zinc-400'
                        )}
                    >
                        Hari {day}
                    </button>
                ))}
            </div>
        </div>
    );
}
