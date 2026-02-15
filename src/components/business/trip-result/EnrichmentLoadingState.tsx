'use client';

import React from 'react';
import { Sparkles, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function EnrichmentLoadingState() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* AI Processing Banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-50/80 to-blue-50/80 backdrop-blur-md border border-indigo-100 p-5 rounded-3xl flex items-center gap-4 shadow-sm group">
                {/* Progress Pulse line */}
                <div className="absolute bottom-0 left-0 h-1 bg-indigo-400/30 animate-[loading-progress_3s_ease-in-out_infinite]" />

                <div className="bg-white p-3 rounded-2xl shadow-sm">
                    <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-base font-bold text-indigo-900 leading-none mb-1">AI is crafting your journey...</h4>
                    <p className="text-sm text-indigo-700/70 font-medium">Fine-tuning routes and local secrets ✨</p>
                </div>
            </div>

            {/* Skeleton Timeline Cards */}
            <div className="space-y-6 relative ml-2">
                {[1, 2, 3].map((i) => (
                    <div key={`skeleton-item-${i}`} className="relative pl-10 pb-8 last:pb-0">
                        {/* Connector Line */}
                        <div className="absolute left-[16.5px] top-8 bottom-0 w-[3px] bg-slate-100 rounded-full" />

                        {/* Dot Marker */}
                        <div className="absolute left-0 top-1 w-9 h-9 rounded-full bg-white border-4 border-slate-100 z-10 shadow-sm" />

                        {/* Skeleton Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 opacity-70">
                            {/* Time & Title Row */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="h-6 w-24 bg-slate-100 rounded-lg animate-pulse" />
                                <div className="h-6 w-40 bg-slate-100 rounded-lg animate-pulse flex-1" />
                            </div>

                            {/* Icons row */}
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-3 w-20 bg-slate-50 rounded animate-pulse" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-3 w-28 bg-slate-50 rounded animate-pulse" />
                                </div>
                            </div>

                            {/* Body Paragraph */}
                            <div className="space-y-2">
                                <div className="h-3 w-full bg-slate-50/80 rounded animate-pulse" />
                                <div className="h-3 w-5/6 bg-slate-50/80 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes loading-progress {
                    0% { width: 0; left: 0%; right: 100%; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { width: 0; left: 100%; right: 0%; opacity: 0; }
                }
            `}</style>
        </div>
    );
}
