'use client';

import React from 'react';
import { cn } from "@/lib/utils";
import { Zap, Flame, Ban } from "lucide-react";

interface SlotCounterProps {
    count: number;
    className?: string;
}

export default function SlotCounter({ count, className }: SlotCounterProps) {
    const totalSlots = 100;
    const remaining = Math.max(0, totalSlots - count);

    // State C: Sold Out
    if (remaining === 0) {
        return (
            <div className={cn("flex flex-col items-center gap-1.5", className)}>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 shadow-sm">
                    <Ban className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Waitlist Full</span>
                </div>
            </div>
        );
    }

    // State B: Low Availability (<= 20)
    if (remaining <= 20) {
        return (
            <div className={cn("flex flex-col items-center gap-1.5 animate-in fade-in duration-700", className)}>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-sm animate-pulse">
                    <Flame className="w-3 h-3 fill-rose-600" />
                    <span className="text-[10px] font-black uppercase tracking-wider truncate">
                        Only {remaining} Spots Left!
                    </span>
                </div>
                <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest animate-bounce">
                    Grab yours now
                </p>
            </div>
        );
    }

    // State A: High Availability (> 20)
    return (
        <div className={cn("flex flex-col items-center gap-1.5", className)}>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100 shadow-sm">
                <Zap className="w-3 h-3 fill-teal-700" />
                <span className="text-[10px] font-black uppercase tracking-wider">Limited Founder Batch</span>
            </div>
            <p className="text-[9px] text-teal-600/60 font-bold uppercase tracking-widest">
                Join the early adopters
            </p>
        </div>
    );
}
