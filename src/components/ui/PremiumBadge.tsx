'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumBadgeProps {
    text: string;
    className?: string;
    showSparkle?: boolean;
}

export default function PremiumBadge({ text, className, showSparkle = true }: PremiumBadgeProps) {
    return (
        <Badge
            variant="outline"
            className={cn(
                "text-[10px] bg-teal-50 text-teal-700 border-teal-200 gap-1.5 py-1 px-2.5 font-black uppercase tracking-widest shadow-sm animate-in fade-in zoom-in-95 duration-500",
                className
            )}
        >
            {showSparkle && <Sparkles className="w-3 h-3 text-teal-500 animate-pulse" />}
            {text}
        </Badge>
    );
}
