'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Compass, Map, Camera, Sparkles, CheckCircle2, Circle, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

// Pesan berganti-ganti
const LOADING_MESSAGES = [
    "Connecting to global travel database...",
    "Scanning city vibes & culture...",
    "Curating hidden gems for you...",
    "Looking for the best local food...",
    "Fetching stunning visuals...",
];

// Simulasi Steps khusus Discovery
const FAKE_STEPS = [
    { id: 'data', label: 'City Data', icon: Map },
    { id: 'vibe', label: 'Vibe Check', icon: Sparkles },
    { id: 'img', label: 'Visuals', icon: Camera },
];

interface DiscoveryLoadingProps {
    city: string;
}

export default function DiscoveryLoading({ city }: DiscoveryLoadingProps) {
    const [progress, setProgress] = useState(10);
    const [messageIndex, setMessageIndex] = useState(0);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    // 1. Cycle Text Messages
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // 2. Simulate Progress Bar & Steps
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((old) => {
                if (old >= 95) return 95; // Mentok di 95% sampai data asli datang
                // Saat progress naik, kita update "active step" visualnya
                if (old > 30) setActiveStepIndex(1);
                if (old > 70) setActiveStepIndex(2);
                return old + Math.random() * 15; // Random jump biar natural
            });
        }, 800);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md animate-in fade-in duration-500 px-4">

            <div className="w-full max-w-xl space-y-8">
                <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl ring-1 ring-teal-900/5 overflow-hidden relative">

                    {/* Dekorasi Background Bergerak (Teal Theme) */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-500 animate-gradient-x" />

                    <CardContent className="p-8 md:p-10 text-center space-y-8">

                        {/* 1. ICON UTAMA (ANIMATED) */}
                        <div className="relative mx-auto w-24 h-24">
                            <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-30" />
                            <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 w-24 h-24 rounded-full flex items-center justify-center border border-teal-100 shadow-inner">
                                <Compass className="w-10 h-10 text-teal-600 animate-pulse" />
                            </div>
                            {/* Orbiting element */}
                            <div className="absolute top-0 left-0 w-full h-full animate-spin-slow">
                                <div className="w-3 h-3 bg-emerald-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 shadow-lg shadow-emerald-400/50" />
                            </div>
                        </div>

                        {/* 2. DYNAMIC TEXT & PROGRESS BAR */}
                        <div className="space-y-4 max-w-sm mx-auto">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                                Discovering <span className="text-teal-600">{city}</span>
                            </h2>
                            <p className="text-slate-500 font-medium text-sm min-h-[20px] transition-all duration-300 animate-pulse">
                                {LOADING_MESSAGES[messageIndex]}
                            </p>

                            <div className="relative pt-4">
                                <Progress value={progress} className="h-2 bg-slate-100" />
                                <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono uppercase tracking-wider">
                                    <span>Initializing</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. SIMULATED STEPS (Visual Only) */}
                        <div className="grid grid-cols-3 gap-3 pt-2 text-left">
                            {FAKE_STEPS.map((step, idx) => {
                                // Logic Status:
                                // Jika index < activeStepIndex -> Complete
                                // Jika index == activeStepIndex -> Loading
                                // Jika index > activeStepIndex -> Pending
                                const isComplete = idx < activeStepIndex;
                                const isLoading = idx === activeStepIndex;
                                const StatusIcon = isComplete ? CheckCircle2 : isLoading ? Sparkles : Circle;
                                const LucideIcon = step.icon;

                                return (
                                    <div key={step.id} className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-500",
                                        isComplete ? "bg-emerald-50/50 border-emerald-100" :
                                            isLoading ? "bg-teal-50 border-teal-200 shadow-sm scale-105" : "bg-slate-50 border-slate-100 opacity-50"
                                    )}>
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                            isComplete ? "bg-emerald-100 text-emerald-600" :
                                                isLoading ? "bg-teal-100 text-teal-600 animate-spin-slow" : "bg-slate-200 text-slate-400"
                                        )}>
                                            <LucideIcon className="w-4 h-4" />
                                        </div>
                                        <div className="text-center">
                                            <p className={cn("text-[10px] font-bold uppercase tracking-wider", isComplete ? "text-emerald-700" : "text-slate-600")}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                    </CardContent>
                </Card>

                {/* 4. QUOTE */}
                <p className="text-center text-slate-400 text-xs italic animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
                    "To travel is to live." – Hans Christian Andersen
                </p>
            </div>
        </div>
    );
}