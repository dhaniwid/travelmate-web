import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Plane, Map, BedDouble, CheckCircle2, Circle, Sparkles, Shirt, Brain } from 'lucide-react';
import { ProgressStep } from '../GenerationProgress';
import { cn } from '@/lib/utils';

// Teks siklus berbahasa Indonesia — memberi kesan AI agent yang aktif bekerja
const LOADING_MESSAGES = [
    "Menyiapkan koper virtual Anda...",
    "Mencari rute dan akomodasi terbaik...",
    "Menemukan permata tersembunyi di destinasi...",
    "Merangkai jadwal perjalanan yang sempurna...",
];

export default function LoadingOverlay({ steps: initialSteps, isDone = false }: { steps: ProgressStep[], isDone?: boolean }) {
    const [progress, setProgress] = useState(0);
    const [messageIndex, setMessageIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [simulatedSteps, setSimulatedSteps] = useState<ProgressStep[]>(initialSteps);

    // Efek: Mengubah teks loading setiap 2.5 detik agar terasa hidup seperti AI agent
    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Simulation Timer
    useEffect(() => {
        if (isDone) {
            setProgress(100);
            setSimulatedSteps(prev => prev.map(s => ({ ...s, status: 'complete' })));
            return;
        }

        const timer = setInterval(() => {
            setElapsed(prev => prev + 0.5);
        }, 500);

        return () => clearInterval(timer);
    }, [isDone]);

    // Progress Calculation
    useEffect(() => {
        if (isDone) return;

        let newProgress = 0;
        let activeIdx = 0;

        // Simulation Rules:
        // 0-3s: -> 25%, Step 0
        // 3-8s: -> 60%, Step 1
        // 8-12s: -> 90%, Step 2
        // >12s: -> 95%, Step 3
        if (elapsed < 3) {
            newProgress = (elapsed / 3) * 25;
            activeIdx = 0;
        } else if (elapsed < 8) {
            newProgress = 25 + ((elapsed - 3) / 5) * 35;
            activeIdx = 1;
        } else if (elapsed < 12) {
            newProgress = 60 + ((elapsed - 8) / 4) * 30;
            activeIdx = 2;
        } else {
            newProgress = 90 + Math.min(5, (elapsed - 12) * 0.5);
            activeIdx = 3;
        }

        setProgress(newProgress);
        setSimulatedSteps(prev => prev.map((s, idx) => {
            if (idx < activeIdx) return { ...s, status: 'complete' };
            if (idx === activeIdx) return { ...s, status: 'loading' };
            return { ...s, status: 'pending' };
        }));
    }, [elapsed, isDone]);

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
                            {isDone ? "Your Adventure is Ready!" : "Crafting Your Adventure"}
                        </h2>
                        <p className="text-slate-500 font-medium min-h-[24px] transition-all duration-500">
                            {isDone ? "Hold on, we're taking you there..." : LOADING_MESSAGES[messageIndex]}
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

                    <div className="space-y-3 max-w-md mx-auto w-full text-left">
                        {simulatedSteps.map((step, idx) => (
                            <StepItem
                                key={step.id}
                                step={step}
                                icon={
                                    idx === 0 ? <Brain className="w-4 h-4" /> :
                                        idx === 1 ? <Map className="w-4 h-4" /> :
                                            idx === 2 ? <BedDouble className="w-4 h-4" /> :
                                                <Shirt className="w-4 h-4" />
                                }
                                label={step.label}
                                eta={idx === 0 ? "~2s" : idx === 1 ? "~4s" : idx === 2 ? "~2s" : "~1s"}
                            />
                        ))}
                    </div>

                </CardContent>
            </Card>

            {/* 4. QUOTE OF THE MOMENT (Optional) */}
            <p className="text-center text-slate-400 text-sm italic animate-pulse">
                "The journey of a thousand miles begins with a single step."
            </p>
        </div >
    );
}

function StepItem({ step, icon, label, eta }: { step?: ProgressStep, icon: React.ReactNode, label: string, eta: string }) {
    const isComplete = step?.status === 'complete';
    const isLoading = step?.status === 'loading';

    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl border transition-all duration-500",
            isComplete ? "bg-emerald-50 border-emerald-100" :
                isLoading ? "bg-blue-50 border-blue-100 shadow-sm scale-105" : "bg-slate-50 border-slate-100 opacity-60"
        )}>
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
                isComplete ? "bg-emerald-100 text-emerald-600" :
                    isLoading ? "bg-blue-100 text-blue-600 animate-spin" : "bg-slate-200 text-slate-400"
            )}>
                {isComplete ? <CheckCircle2 className="w-4 h-4" /> : isLoading ? <Sparkles className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>
            <div>
                <p className={cn("text-xs font-bold", isComplete ? "text-emerald-700" : "text-slate-700")}>{label}</p>
                <div className="flex gap-2 text-[10px] text-slate-400">
                    <span>{isComplete ? "Done" : isLoading ? "In Progress..." : "Pending"}</span>
                    {!isComplete && !isLoading && <span>({eta})</span>}
                </div>
            </div>
        </div>
    );
}