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
        <div className="flex flex-col items-center justify-center p-8 md:p-12 min-h-[500px] animate-in fade-in duration-500 bg-white rounded-2xl border border-zinc-200 overflow-hidden relative">
            <div className="relative mb-8">
                <div className="relative bg-zinc-950 p-6 rounded-2xl shadow-lg">
                    <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" />
                </div>
            </div>

            <div className="text-center space-y-3 max-w-lg mb-10 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-zinc-950 tracking-tight leading-tight">
                    Menyusun rencana <span className="text-teal-600">harianmu</span>...
                </h3>
                <p className="text-zinc-600 font-medium text-sm md:text-base leading-relaxed px-4">
                    Miru sedang mengoptimalkan rute dan memilih tempat terbaik untukmu. Biasanya selesai dalam <span className="text-zinc-950 font-bold">30 detik</span>.
                </p>

                {/* Progress Bar Simulation */}
                <div className="mt-6 mx-auto w-64 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
                    <div
                        className="h-full bg-zinc-950 rounded-full transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Visual content placeholder (Skeleton) */}
            <div className="w-full max-w-2xl opacity-60 mask-linear-gradient">
                <div className="scale-95 origin-top space-y-8">
                    <div className="h-10 w-48 bg-zinc-100 rounded-xl mb-8 animate-pulse" />
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
