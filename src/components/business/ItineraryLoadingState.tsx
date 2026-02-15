'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import ItinerarySkeleton from './ItinerarySkeleton';

export default function ItineraryLoadingState({ startTime }: { startTime?: number }) {
    const [progress, setProgress] = React.useState(5);

    React.useEffect(() => {
        if (!startTime) return;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const duration = 30000; // 30 seconds target
            const nextProgress = Math.min(95, (elapsed / duration) * 100);
            setProgress(nextProgress);
        };

        updateProgress();
        const interval = setInterval(updateProgress, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    return (
        <div className="flex flex-col items-center justify-center p-8 md:p-12 min-h-[500px] animate-in fade-in zoom-in duration-700 bg-white/5 backdrop-blur-sm rounded-[48px] border border-white/10 shadow-2xl overflow-hidden relative">
            {/* Ambient background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full -z-10" />

            <div className="relative mb-10 group">
                <div className="absolute inset-0 bg-teal-500/30 blur-3xl rounded-full animate-pulse group-hover:scale-110 transition-transform duration-700" />
                <div className="relative bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-2xl border border-white/20 p-10 rounded-[40px] shadow-2xl ring-1 ring-white/30">
                    <Sparkles className="w-14 h-14 text-teal-400 animate-pulse drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                </div>
            </div>

            <div className="text-center space-y-4 max-w-lg mb-12 relative z-10">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                    Curating your <span className="text-teal-600">Day-by-Day</span> Plan...
                </h3>
                <p className="text-slate-500 font-medium text-lg leading-relaxed px-4">
                    We are optimizing routes and selecting the best spots for you.
                    This usually takes about <span className="text-teal-600 font-bold">30 seconds</span>.
                </p>

                {/* Progress Bar Simulation */}
                <div className="mt-8 mx-auto w-64 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 p-[1px]">
                    <div
                        className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Visual content placeholder (Skeleton) */}
            <div className="w-full max-w-2xl opacity-40 mask-linear-gradient">
                <div className="scale-95 origin-top space-y-8">
                    <div className="h-10 w-48 bg-slate-200/50 rounded-2xl mb-8 animate-pulse" />
                    <ItinerarySkeleton />
                </div>
            </div>

            <style jsx>{`
                .mask-linear-gradient {
                    mask-image: linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);
                }
            `}</style>
        </div>
    );
}
