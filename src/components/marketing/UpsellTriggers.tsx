'use client';

import React from 'react';
import PremiumBadge from '@/components/ui/PremiumBadge';
import { Button } from '@/components/ui/button';
import { Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpsellLockedStateProps {
    featureName: string;
    description: string;
    onUpgrade: () => void;
    className?: string;
}

export function UpsellLockedState({ featureName, description, onUpgrade, className }: UpsellLockedStateProps) {
    return (
        <div className={cn(
            "p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center text-center gap-4",
            className
        )}>
            <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100">
                <Lock className="w-5 h-5 text-slate-400" />
            </div>
            <div>
                <PremiumBadge text="PRO FEATURE" className="mb-2" />
                <h4 className="text-sm font-bold text-slate-900">{featureName}</h4>
                <p className="text-xs text-slate-500 max-w-[200px] mx-auto mt-1">{description}</p>
            </div>
            <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-full px-6 font-bold text-xs"
            >
                Upgrade to Unlock
            </Button>
        </div>
    );
}

export function ProSparkleIndicator() {
    return (
        <div className="relative inline-flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500 border border-white/50"></span>
        </div>
    );
}
