import React from 'react';
import { cn } from '@/lib/utils';

interface DayNavigatorProps {
    days: number[];
    activeDay: number;
    onDayClick: (day: number) => void;
}

export default function DayNavigator({ days, activeDay, onDayClick }: DayNavigatorProps) {
    return (
        <div className="sticky top-16 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 py-2 shadow-sm overflow-x-auto no-scrollbar">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex items-center space-x-8 h-16">
                    {days.map((day) => (
                        <button
                            key={day}
                            onClick={() => onDayClick(day)}
                            className={cn(
                                "flex-shrink-0 relative h-full flex items-center px-4 font-bold text-sm transition-all hover:text-[#42707D]",
                                activeDay === day ? "text-[#42707D]" : "text-slate-400"
                            )}
                        >
                            Day {day}
                            {activeDay === day && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#42707D] rounded-t-full" />
                            )}
                        </button>
                    ))}
                    {/* Add a spacer or 'View More' if needed */}
                </div>
            </div>
        </div>
    );
}
