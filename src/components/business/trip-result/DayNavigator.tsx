import React from 'react';
import { cn } from '@/lib/utils';

interface DayNavigatorProps {
    days: number[];
    activeDay: number;
    onDayClick: (day: number) => void;
    className?: string;
}

export default function DayNavigator({ days, activeDay, onDayClick, className }: DayNavigatorProps) {
    return (
        <div className={cn(
            "sticky top-[56px] z-30 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 py-1 overflow-x-auto no-scrollbar",
            className
        )}>
            <div className="px-4 md:px-0">
                <div className="flex items-center space-x-1 h-12">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs transition-all",
                                activeDay === day
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            )}
                        >
                            Day {day}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
