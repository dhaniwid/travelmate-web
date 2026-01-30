import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plane, Map, BedDouble, CheckCircle2, Circle, Sparkles, Shirt } from 'lucide-react';
import { ProgressStep } from '../GenerationProgress';
import { cn } from '@/lib/utils';

// Kata-kata "bumbu" biar user tidak bosan
const LOADING_MESSAGES = [
    "Analyzing your travel style...",
    "Scanning the map for hidden gems...",
    "Checking weather patterns...",
    "Curating the best culinary spots...",
    "Optimizing travel routes...",
    "Finding cozy places to stay...",
    "Packing your virtual bags..."
];

export default function LoadingOverlay({ steps }: { steps: ProgressStep[] }) {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);

    // Efek: Mengubah teks loading setiap 3 detik agar terasa "hidup"
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Efek: Menghitung persentase progress bar berdasarkan step yang selesai
    useEffect(() => {
        const completed = steps.filter(s => s.status === 'complete').length;
        const total = steps.length;
        // Rumus sederhana: (Selesai / Total) * 100
        // Ditambah sedikit 'randomness' biar terlihat organik
        const targetProgress = (completed / total) * 100;
        setProgress(targetProgress + 10); // +10 biar gak mulai dari 0 banget
    }, [steps]);

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in duration-700">
            <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md ring-1 ring-slate-200/50 overflow-hidden relative">

                {/* Dekorasi Background Bergerak */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-blue-500 animate-gradient-x" />

                <CardContent className="p-8 md:p-12 text-center space-y-8">

                    {/* 1. ICON UTAMA (ANIMATED) */}
                    <div className="relative mx-auto w-24 h-24">
                        <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20" />
                        <div className="relative bg-gradient-to-br from-blue-50 to-teal-50 w-24 h-24 rounded-full flex items-center justify-center border border-blue-100 shadow-inner">
                            <Plane className="w-10 h-10 text-blue-600 animate-pulse" />
                        </div>
                        {/* Orbiting element */}
                        <div className="absolute top-0 left-0 w-full h-full animate-spin-slow">
                            <div className="w-3 h-3 bg-teal-400 rounded-full absolute top-2 left-1/2 transform -translate-x-1/2 shadow-lg shadow-teal-400/50" />
                        </div>
                    </div>

                    {/* 2. DYNAMIC TEXT & PROGRESS BAR */}
                    <div className="space-y-4 max-w-md mx-auto">
                        <h2 className="text-2xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-teal-600">
                            Crafting Your Adventure
                        </h2>
                        <p className="text-slate-500 font-medium min-h-[24px] transition-all duration-500">
                            {LOADING_MESSAGES[messageIndex]}
                        </p>
                        <div className="relative pt-2">
                            <Progress value={progress} className="h-2 bg-slate-100" />
                            <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono">
                                <span>Start</span>
                                <span>{Math.round(progress)}%</span>
                                <span>Ready</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. STEPPER VISUALIZATION (TASK LIST) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-left">
                        {/* Helper function to render step */}
                        <StepItem
                            step={steps.find(s => s.id === 'iti')}
                            icon={<Map className="w-4 h-4"/>}
                            label="Designing Itinerary"
                        />
                        <StepItem
                            step={steps.find(s => s.id === 'log')}
                            icon={<BedDouble className="w-4 h-4"/>}
                            label="Checking Logistics"
                        />
                        <StepItem
                            step={steps.find(s => s.id === 'final')}
                            icon={<Shirt className="w-4 h-4"/>}
                            label="Packing Essentials"
                        />
                    </div>

                </CardContent>
            </Card>

            {/* 4. QUOTE OF THE MOMENT (Optional) */}
            <p className="text-center text-slate-400 text-sm italic animate-pulse">
                "The journey of a thousand miles begins with a single step."
            </p>
        </div>
    );
}

function StepItem({ step, icon, label }: { step?: ProgressStep, icon: React.ReactNode, label: string }) {
    const isComplete = step?.status === 'complete';
    const isLoading = step?.status === 'loading';

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
            isComplete ? "bg-emerald-50 border-emerald-100" :
                isLoading ? "bg-blue-50 border-blue-100 shadow-sm scale-105" : "bg-slate-50 border-slate-100 opacity-60"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                isComplete ? "bg-emerald-100 text-emerald-600" :
                    isLoading ? "bg-blue-100 text-blue-600 animate-spin" : "bg-slate-200 text-slate-400"
            )}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : isLoading ? <Sparkles className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>
            <div>
                <p className={cn("text-xs font-bold", isComplete ? "text-emerald-700" : "text-slate-700")}>{label}</p>
                <p className="text-[10px] text-slate-400">
                    {isComplete ? "Done" : isLoading ? "In Progress..." : "Pending"}
                </p>
            </div>
        </div>
    );
}